import { describe, expect, it } from "vitest";
import { availableTaskMoves, taskActionLabel } from "./delivery-presentation";
import type { DeliveryCard } from "./delivery-types";

const task = (
	stage: DeliveryCard["stage"],
	changes: Partial<DeliveryCard> = {},
) =>
	({
		stage,
		assignee_user_id: "developer",
		reviewer_user_id: "owner",
		can_start: true,
		...changes,
	}) as DeliveryCard;

describe("task actions", () => {
	it("keeps unavailable starts out of the direct actions", () => {
		expect(
			availableTaskMoves(task("READY"), "MEMBER", "developer", true),
		).not.toContain("ACTIVE");
		expect(
			availableTaskMoves(
				task("READY", { can_start: false }),
				"MEMBER",
				"developer",
				false,
			),
		).not.toContain("ACTIVE");
		expect(
			availableTaskMoves(task("READY"), "MEMBER", "developer", false),
		).toContain("ACTIVE");
	});
	it("allows separate reviewers and prevents self-review even for an owner", () => {
		expect(
			availableTaskMoves(task("REVIEW"), "MEMBER", "developer", false),
		).not.toContain("VERIFY");
		expect(
			availableTaskMoves(task("REVIEW"), "OWNER", "developer", false),
		).not.toContain("VERIFY");
		expect(
			availableTaskMoves(task("REVIEW"), "MEMBER", "owner", false),
		).toContain("VERIFY");
		expect(
			availableTaskMoves(task("VERIFY"), "OWNER", "owner", false),
		).toContain("DONE");
		expect(
			availableTaskMoves(task("VERIFY"), "MEMBER", "other", false),
		).not.toContain("DONE");
	});
	it("keeps the existing review and blocker sequence", () => {
		expect(
			availableTaskMoves(task("ACTIVE"), "MEMBER", "developer", false),
		).toEqual(["REVIEW", "BLOCKED", "BACKLOG"]);
		expect(
			availableTaskMoves(task("BLOCKED"), "MEMBER", "developer", false),
		).toEqual(["READY", "BACKLOG"]);
		expect(taskActionLabel("ACTIVE", "REVIEW")).toBe("Send for review");
		expect(taskActionLabel("BLOCKED", "READY")).toBe("Clear blocker");
	});
});
