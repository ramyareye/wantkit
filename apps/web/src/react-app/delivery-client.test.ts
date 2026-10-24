import { describe, expect, it, vi } from "vitest";
import {
	approvalCommand,
	canApprove,
	currentWeek,
	DeliveryClient,
} from "./delivery-client";
import type { Week } from "./delivery-types";
const success = (data: unknown) => Response.json({ success: true, data });
const week: Week = {
	id: "week",
	workspace_id: "ws",
	user_id: "person",
	week_start_date: "2026-10-19",
	week_start: 1,
	timezone: "Europe/Amsterdam",
	state: "submitted",
	version: 7,
	revision: 1,
	entries: [
		{
			id: "entry",
			project_id: "grow",
			task_id: "task",
			work_date: "2026-10-20",
			activity: "qa",
			minutes: 90,
			note: "Device QA",
		},
	],
	submission: { at: "now", over_cap: false, cap_minutes: null },
	approval: null,
	payment_status: "manual_unrecorded",
};
describe("Delivery client safety", () => {
	it("retries the exact mutation and key after an ambiguous failure, blocking other writes", async () => {
		const calls: RequestInit[] = [];
		const send: typeof fetch = async (_input, init) => {
			calls.push(init!);
			if (calls.length === 1) throw new Error("Response lost");
			return success(week);
		};
		const client = new DeliveryClient("synthetic-personal-key", send);
		const body = { action: "save_entry", version: 6 };
		await expect(client.mutate("POST", "/week/actions", body)).rejects.toThrow(
			"Response lost",
		);
		body.version = 99;
		await expect(client.mutate("POST", "/different", {})).rejects.toThrow(
			"Retry",
		);
		expect(await client.retry()).toEqual(week);
		expect(calls[0].body).toEqual(calls[1].body);
		expect(JSON.parse(String(calls[1].body)).body.version).toBe(6);
		expect(client.needsRetry).toBe(false);
	});
	it("blocks double-clicks while an action is in flight", async () => {
		let finish!: (value: Response) => void;
		const send = vi.fn<typeof fetch>(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const client = new DeliveryClient("synthetic-key-value", send);
		const pending = client.mutate("POST", "/week", {});
		await expect(client.retry()).rejects.toThrow("already running");
		finish(success(week));
		await pending;
		expect(send).toHaveBeenCalledTimes(1);
	});
	it("clears definitively rejected writes and discards credentials on disconnect", async () => {
		const send = vi.fn<typeof fetch>(async () =>
			Response.json(
				{
					success: false,
					error: { code: "VERSION_CONFLICT", message: "Reload" },
				},
				{ status: 409 },
			),
		);
		const client = new DeliveryClient("synthetic-key-value", send);
		await expect(client.mutate("POST", "/week", {})).rejects.toThrow("Reload");
		expect(client.needsRetry).toBe(false);
		client.disconnect();
		await expect(client.get("/v1/me")).rejects.toThrow("Reconnect");
		expect(send).toHaveBeenCalledTimes(1);
	});
	it("reads every page and detects repeated cursors", async () => {
		let count = 0;
		const client = new DeliveryClient("synthetic-key-value", async () =>
			success({
				weeks: [++count],
				pagination: { has_more: count === 1, next_cursor: "cursor" },
			}),
		);
		expect(await client.all("/weeks?from=x", "weeks")).toEqual([1, 2]);
		const broken = new DeliveryClient("synthetic-key-value", async () =>
			success({
				weeks: [],
				pagination: { has_more: true, next_cursor: "same" },
			}),
		);
		await expect(broken.all("/weeks", "weeks")).rejects.toThrow(
			"Too many records",
		);
	});
	it("keeps calendar dates stable around Amsterdam DST and midnight", () => {
		expect(
			currentWeek("Europe/Amsterdam", 1, new Date("2026-10-25T23:30:00Z")),
		).toBe("2026-10-26");
		expect(
			currentWeek("Europe/Amsterdam", 1, new Date("2026-10-24T23:30:00Z")),
		).toBe("2026-10-19");
	});
	it("forbids self approval and enforces deliberate reductions without mutating submitted entries", () => {
		expect(canApprove(week, "person", true)).toBe(false);
		expect(canApprove(week, "owner", false)).toBe(false);
		expect(canApprove(week, "owner", true)).toBe(true);
		for (const minutes of ["", "-1", "91", "1.5"])
			expect(() =>
				approvalCommand(week, { entry: minutes }, "reason", false),
			).toThrow();
		expect(() => approvalCommand(week, { entry: "60" }, "", false)).toThrow(
			"Explain",
		);
		expect(
			approvalCommand(week, { entry: "60" }, "Duplicate half hour", false),
		).toEqual({
			action: "approve",
			version: 7,
			entries: [{ entry_id: "entry", approved_minutes: 60 }],
			reason: "Duplicate half hour",
		});
		expect(week.entries[0].minutes).toBe(90);
	});
});
