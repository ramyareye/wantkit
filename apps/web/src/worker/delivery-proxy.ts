import { z } from "zod";

// The destination is operator configuration, never a caller-supplied URL.
export interface DeliveryBindings {
	TODOLESS_API_ORIGIN?: string;
	BETTER_AUTH_URL: string;
}
const identifier = "[A-Za-z0-9_-]{1,200}";
const workspace = `/v1/workspaces/${identifier}`;
const week = `${workspace}/time/weeks/${identifier}`;
const allowedReads = new RegExp(
	`^(?:/v1/me(?:/portfolio)?|/v1/workspaces|${workspace}/(?:projects|members|tasks|delivery/queue|time/(?:settings|weeks|report|export\\.csv))|${week}(?:/history)?|/v1/tasks/${identifier}/(?:delivery|history))$`,
);
const allowedWrites = {
	POST: new RegExp(`^(?:${workspace}/time/weeks|${week}/actions)$`),
	PUT: new RegExp(`^(?:/v1/tasks/${identifier}/delivery|/v1/me/portfolio)$`),
};
const envelopeSchema = z
	.object({
		method: z.enum(["GET", "POST", "PUT"]),
		path: z.string().max(3000),
		body: z.record(z.string(), z.unknown()).optional(),
		idempotency_key: z
			.string()
			.regex(/^[A-Za-z0-9_.:-]{8,120}$/)
			.optional(),
	})
	.strict();
function fail(status: number, code: string, message: string) {
	return Response.json(
		{ success: false, error: { code, message } },
		{ status, headers: { "cache-control": "no-store" } },
	);
}
export async function forwardDelivery(
	request: Request,
	bindings: DeliveryBindings,
	send: typeof fetch = fetch,
): Promise<Response> {
	const origin = request.headers.get("origin");
	// Even reads use POST and carry a key. Do not allow cross-origin browser use.
	if (
		origin !== new URL(bindings.BETTER_AUTH_URL).origin ||
		request.headers.get("sec-fetch-site") === "cross-site"
	)
		return fail(
			403,
			"FORBIDDEN",
			"Open Delivery from the signed-in HopKit app.",
		);
	if (!bindings.TODOLESS_API_ORIGIN)
		return fail(
			503,
			"DELIVERY_NOT_CONFIGURED",
			"Delivery is not connected to Todoless in this environment yet.",
		);
	let target: URL;
	try {
		target = new URL(bindings.TODOLESS_API_ORIGIN);
		const loopback = (u: URL) =>
			["127.0.0.1", "localhost", "[::1]"].includes(u.hostname);
		if (
			target.username ||
			target.password ||
			target.search ||
			target.hash ||
			target.pathname !== "/" ||
			(target.protocol !== "https:" &&
				!(
					target.protocol === "http:" &&
					loopback(target) &&
					loopback(new URL(bindings.BETTER_AUTH_URL))
				))
		)
			throw new Error();
	} catch {
		return fail(
			503,
			"DELIVERY_NOT_CONFIGURED",
			"The Todoless connection needs operator configuration.",
		);
	}
	if (
		!request.headers
			.get("content-type")
			?.toLowerCase()
			.startsWith("application/json")
	)
		return fail(415, "INVALID_CONTENT_TYPE", "Use application/json.");
	const key = request.headers.get("x-todoless-key") ?? "";
	if (!/^[A-Za-z0-9_-]{16,512}$/.test(key))
		return fail(401, "KEY_REQUIRED", "Enter your personal Todoless key.");
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return fail(400, "INVALID_JSON", "Invalid request body.");
	}
	const parsed = envelopeSchema.safeParse(raw);
	if (!parsed.success)
		return fail(400, "BAD_REQUEST", "Invalid delivery request.");
	const { method, path, body, idempotency_key } = parsed.data;
	const [pathname, query = ""] = path.split("?");
	if (
		path.split("?").length > 2 ||
		pathname.includes("%") ||
		(method === "GET"
			? !allowedReads.test(pathname) ||
				body !== undefined ||
				idempotency_key !== undefined
			: !allowedWrites[method].test(pathname) || !body || !idempotency_key)
	)
		return fail(
			400,
			"BAD_REQUEST",
			"This operation is not available in Delivery.",
		);
	const params = new URLSearchParams(query);
	const allowedParams = new Set(
		pathname === "/v1/me/portfolio"
			? ["week_start_date"]
			: pathname.endsWith("/history")
				? ["limit", "cursor"]
				: [
						"from",
						"to",
						"user_id",
						"limit",
						"cursor",
						"project_id",
						"assignee_id",
					],
	);
	for (const [name, value] of params) {
		if (
			method !== "GET" ||
			!allowedParams.has(name) ||
			params.getAll(name).length !== 1 ||
			value.length > 1000
		)
			return fail(400, "BAD_REQUEST", "Invalid delivery query.");
	}
	const headers = new Headers({
		authorization: `Bearer ${key}`,
		accept: "application/json",
	});
	if (method !== "GET") {
		headers.set("content-type", "application/json");
		headers.set("idempotency-key", idempotency_key!);
	}
	try {
		const upstream = await send(new URL(path, target), {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
			redirect: "manual",
			signal: AbortSignal.timeout(20_000),
		});
		// Never forward redirects, cookies, authorization headers or upstream HTML.
		const csv = pathname.endsWith("/export.csv") && upstream.ok;
		const expected = csv ? "text/csv" : "application/json";
		if (
			(upstream.status >= 300 && upstream.status < 400) ||
			!upstream.headers.get("content-type")?.includes(expected)
		)
			return fail(
				502,
				"DELIVERY_UNAVAILABLE",
				"Todoless returned an unexpected response. Retry the same action.",
			);
		return new Response(upstream.body, {
			status: upstream.status,
			headers: {
				"content-type": csv
					? "text/csv; charset=utf-8"
					: "application/json; charset=utf-8",
				"cache-control": "no-store",
				"x-content-type-options": "nosniff",
				...(csv
					? {
							"content-disposition": 'attachment; filename="todoless-time.csv"',
						}
					: {}),
			},
		});
	} catch {
		return fail(
			502,
			"DELIVERY_UNAVAILABLE",
			"Could not reach Todoless. Retry the same action before making another change.",
		);
	}
}
