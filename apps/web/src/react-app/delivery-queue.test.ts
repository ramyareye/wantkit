import { expect, it } from "vitest";
import type { DeliveryClient } from "./delivery-client";
import type { DeliveryCard, Queue } from "./delivery-types";
import { loadTaskQueue, queueCards } from "./delivery-queue";

const card = (id: string, can_start = true) =>
	({ id, can_start, assignee_user_id: "dev" }) as DeliveryCard;
const base: Queue = {
	active: [],
	active_conflict: false,
	ready_alternatives: [card("a"), card("b")],
	ready_count: 3,
	missing_ready_alternatives: 0,
	blocked: [],
	review: [],
	verify: [],
};
it("retains a third ready task and ignores cards no longer startable", async () => {
	const paths: string[] = [];
	const client: Pick<DeliveryClient, "get" | "all"> = {
		async get<T>(path: string) {
			paths.push(path);
			return (
				path.includes("/queue")
					? base
					: path.includes("/c/")
						? card("c")
						: card("d", false)
			) as T;
		},
		async all<T>() {
			return ["a", "b", "c", "d"].map((id) => ({
				id,
				delivery_state: "READY",
			})) as T[];
		},
	};
	const loaded = await loadTaskQueue(client, "workspace", "dev");
	expect(loaded.ready_alternatives.map((t) => t.id)).toEqual(["a", "b", "c"]);
	expect(paths).not.toContain("/v1/tasks/a/delivery");
});
it("does not fetch more cards when the focus response is complete", async () => {
	const client: Pick<DeliveryClient, "get" | "all"> = {
		async get<T>() {
			return { ...base, ready_count: 2 } as T;
		},
		async all<T>() {
			return Promise.reject<T[]>(new Error("Unexpected additional read"));
		},
	};
	expect(
		(await loadTaskQueue(client, "workspace", "dev")).ready_alternatives,
	).toHaveLength(2);
});
it("shows an active task with a readiness blocker only once", () => {
	const active = card("active", false);
	expect(
		queueCards({ ...base, active: [active], blocked: [active] }).map(
			(t) => t.id,
		),
	).toEqual(["active", "a", "b"]);
});
