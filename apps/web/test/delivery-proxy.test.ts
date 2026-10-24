import { env, exports } from "cloudflare:workers";
import { describe, expect, it, vi } from "vitest";
import { forwardDelivery } from "../src/worker/delivery-proxy";
const bindings = {
	BETTER_AUTH_URL: "https://hopkit.example",
	TODOLESS_API_ORIGIN: "https://tasks.example",
};
function request(
	body: unknown = { method: "GET", path: "/v1/me" },
	headers: Record<string, string> = {},
) {
	return new Request("https://hopkit.example/api/delivery/request", {
		method: "POST",
		headers: {
			origin: bindings.BETTER_AUTH_URL,
			"content-type": "application/json",
			"x-todoless-key": "synthetic-personal-key",
			...headers,
		},
		body: JSON.stringify(body),
	});
}
describe("Delivery proxy boundary", () => {
	it("allows only own portfolio reads/writes and the weekly query", async () => {
		const send = vi.fn<typeof fetch>(async () =>
			Response.json({ success: true, data: { version: 1 } }),
		);
		expect(
			(
				await forwardDelivery(
					request({
						method: "GET",
						path: "/v1/me/portfolio?week_start_date=2026-10-19",
					}),
					bindings,
					send,
				)
			).status,
		).toBe(200);
		expect(
			(
				await forwardDelivery(
					request({
						method: "PUT",
						path: "/v1/me/portfolio",
						body: {
							version: 0,
							availability: [{ date: "2026-10-19", minutes: 0 }],
						},
						idempotency_key: "portfolio-123",
					}),
					bindings,
					send,
				)
			).status,
		).toBe(200);
		expect(
			new Headers(send.mock.calls[1][1]?.headers).get("idempotency-key"),
		).toBe("portfolio-123");
		send.mockClear();
		for (const body of [
			{ method: "GET", path: "/v1/me/portfolio?user_id=other" },
			{
				method: "GET",
				path: "/v1/me/portfolio?week_start_date=a&week_start_date=b",
			},
			{ method: "GET", path: "/v1/users/other/portfolio" },
			{
				method: "POST",
				path: "/v1/me/portfolio",
				body: {},
				idempotency_key: "portfolio-123",
			},
		])
			expect(
				(await forwardDelivery(request(body), bindings, send)).status,
			).toBe(400);
		expect(send).not.toHaveBeenCalled();
	});

	it("allows only paginated history reads and preserves task authorization denials", async () => {
		const send = vi.fn<typeof fetch>(async () =>
			Response.json(
				{ success: false, error: { code: "FORBIDDEN" } },
				{ status: 403 },
			),
		);
		const response = await forwardDelivery(
			request({
				method: "GET",
				path: "/v1/tasks/task/history?limit=100&cursor=next",
			}),
			bindings,
			send,
		);
		expect(response.status).toBe(403);
		expect(String(send.mock.calls[0][0])).toBe(
			"https://tasks.example/v1/tasks/task/history?limit=100&cursor=next",
		);
		expect(
			new Headers(send.mock.calls[0][1]!.headers).get("authorization"),
		).toBe("Bearer synthetic-personal-key");
		send.mockClear();
		for (const body of [
			{ method: "GET", path: "/v1/tasks/task/history?user_id=other" },
			{ method: "GET", path: "/v1/tasks/task/history?limit=1&limit=100" },
			{ method: "GET", path: "/v1/tasks/task/history/extra" },
			{
				method: "PUT",
				path: "/v1/tasks/task/history",
				body: {},
				idempotency_key: "test-key-123",
			},
			{
				method: "POST",
				path: "/v1/tasks/task/history",
				body: {},
				idempotency_key: "test-key-123",
			},
		])
			expect(
				(await forwardDelivery(request(body), bindings, send)).status,
			).toBe(400);
		expect(send).not.toHaveBeenCalled();
	});

	it("requires an actual HopKit session on the registered route", async () => {
		const response = await exports.default.fetch(request());
		expect(response.status).toBe(401);
		expect(response.headers.get("cache-control")).toBe("no-store");
	});
	it("keeps the integration disabled even for a signed-in session until configured", async () => {
		const now = Date.now();
		const user = "delivery-session-user";
		const token = "delivery-session-token";
		await env.DB.batch([
			env.DB.prepare(
				"insert into user (id,name,email,email_verified) values (?,?,?,?)",
			).bind(user, "Pilot", "pilot@example.test", 1),
			env.DB.prepare(
				"insert into session (id,expires_at,token,updated_at,user_id) values (?,?,?,?,?)",
			).bind("delivery-session", now + 3600000, token, now, user),
		]);
		try {
			const key = await crypto.subtle.importKey(
				"raw",
				new TextEncoder().encode(
					"task-3-test-secret-with-at-least-32-characters",
				),
				{ name: "HMAC", hash: "SHA-256" },
				false,
				["sign"],
			);
			const signature = btoa(
				String.fromCharCode(
					...new Uint8Array(
						await crypto.subtle.sign(
							"HMAC",
							key,
							new TextEncoder().encode(token),
						),
					),
				),
			);
			const response = await exports.default.fetch(
				new Request("http://example.com/api/delivery/request", {
					method: "POST",
					headers: {
						cookie: `better-auth.session_token=${token}.${signature}`,
						origin: "http://example.com",
						"content-type": "application/json",
					},
					body: JSON.stringify({ method: "GET", path: "/v1/me" }),
				}),
			);
			expect(response.status).toBe(503);
			expect(await response.text()).toContain("DELIVERY_NOT_CONFIGURED");
		} finally {
			await env.DB.prepare("delete from user where id=?").bind(user).run();
		}
	});
	it("rejects cross-origin, unsupported and credential-management requests before fetch", async () => {
		const send = vi.fn<typeof fetch>();
		expect(
			(
				await forwardDelivery(
					request(undefined, { origin: "https://evil.example" }),
					bindings,
					send,
				)
			).status,
		).toBe(403);
		expect(
			(
				await forwardDelivery(
					request(undefined, { origin: "" }),
					bindings,
					send,
				)
			).status,
		).toBe(403);
		for (const path of [
			"https://evil.example/v1/me",
			"//evil.example/v1/me",
			"/v1/%6de",
			"/v1/workspaces/ws/api-keys",
			"/v1/workspaces/ws/time/settings?foo=bar",
			"/v1/tasks/task/../api-keys",
		])
			expect(
				(
					await forwardDelivery(
						request({ method: "GET", path }),
						bindings,
						send,
					)
				).status,
			).toBe(400);
		for (const path of [
			"/v1/workspaces/ws/time/settings",
			"/v1/workspaces/ws/time/terms",
			"/v1/workspaces/ws/time/approvers/usr",
			"/v1/workspaces/ws/members",
		])
			expect(
				(
					await forwardDelivery(
						request({
							method: "PUT",
							path,
							body: {},
							idempotency_key: "test-key-123",
						}),
						bindings,
						send,
					)
				).status,
			).toBe(400);
		expect(send).not.toHaveBeenCalled();
	});
	it("only forwards the supplied personal key and exact mutation receipt", async () => {
		const send = vi.fn<typeof fetch>(async () =>
			Response.json(
				{ success: true, data: { version: 2 } },
				{ headers: { "set-cookie": "evil=1", "x-upstream-private": "secret" } },
			),
		);
		const response = await forwardDelivery(
			request(
				{
					method: "POST",
					path: "/v1/workspaces/ws/time/weeks/week/actions",
					body: { action: "submit", version: 1, confirmed_human_time: true },
					idempotency_key: "stable-test-key",
				},
				{ cookie: "hopkit-session", authorization: "not-forwarded" },
			),
			bindings,
			send,
		);
		expect(response.status).toBe(200);
		expect(response.headers.get("set-cookie")).toBeNull();
		expect(response.headers.get("x-upstream-private")).toBeNull();
		expect(response.headers.get("cache-control")).toBe("no-store");
		const [url, init] = send.mock.calls[0];
		expect(String(url)).toBe(
			"https://tasks.example/v1/workspaces/ws/time/weeks/week/actions",
		);
		const headers = new Headers(init!.headers);
		expect(headers.get("authorization")).toBe("Bearer synthetic-personal-key");
		expect(headers.get("cookie")).toBeNull();
		expect(headers.get("idempotency-key")).toBe("stable-test-key");
		expect(init!.redirect).toBe("manual");
	});
	it("never follows redirects, relays HTML or uses an unsafe configured destination", async () => {
		for (const response of [
			new Response(null, {
				status: 302,
				headers: { location: "https://evil.example" },
			}),
			new Response("<script>bad</script>", {
				headers: { "content-type": "text/html" },
			}),
		]) {
			const send = vi.fn<typeof fetch>(async () => response);
			expect((await forwardDelivery(request(), bindings, send)).status).toBe(
				502,
			);
			expect(send).toHaveBeenCalledTimes(1);
		}
		const send = vi.fn<typeof fetch>();
		for (const origin of [
			"http://tasks.example",
			"http://127.0.0.1",
			"https://key:secret@tasks.example",
			"https://tasks.example/path",
		])
			expect(
				(
					await forwardDelivery(
						request(),
						{ ...bindings, TODOLESS_API_ORIGIN: origin },
						send,
					)
				).status,
			).toBe(503);
		expect(send).not.toHaveBeenCalled();
	});
	it("preserves backend denials and CSV without converting them to successful writes", async () => {
		const denied = await forwardDelivery(request(), bindings, async () =>
			Response.json(
				{ success: false, error: { code: "FORBIDDEN" } },
				{ status: 403 },
			),
		);
		expect(denied.status).toBe(403);
		const csv = await forwardDelivery(
			request({
				method: "GET",
				path: "/v1/workspaces/ws/time/export.csv?from=2026-10-19&to=2026-10-19",
			}),
			bindings,
			async () =>
				new Response("submitted,approved\n90,60", {
					headers: { "content-type": "text/csv" },
				}),
		);
		expect(await csv.text()).toBe("submitted,approved\n90,60");
		expect(csv.headers.get("content-disposition")).toContain("attachment");
	});
});
