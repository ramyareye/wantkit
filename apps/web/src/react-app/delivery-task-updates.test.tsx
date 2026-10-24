import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DeliveryClient } from "./delivery-client";
import {
	DeliveryProgressForm,
	DeliveryTaskFeedback,
} from "./DeliveryTaskUpdates";
import {
	canUpdateProgress,
	progressCommand,
	taskUpdates,
} from "./delivery-task-updates";
import type { DeliveryCard, Stage, TaskHistoryEntry } from "./delivery-types";
const card: DeliveryCard = {
	id: "task",
	title: "Referral acceptance",
	project_id: "veloura",
	assignee_user_id: "dev",
	status: "IN_PROGRESS",
	version: 8,
	stage: "ACTIVE",
	effective_stage: "ACTIVE",
	reviewer_user_id: "owner",
	can_start: true,
	readiness_issues: [],
	blocker: null,
	depends_on: [],
	details: {
		outcome: "Acceptance script",
		scope: "Preparation",
		next_action: "Check the account switch",
		repository: "repo",
		contract_refs: [],
		acceptance_checks: [],
		evidence: ["docs/qa.md"],
		build_ref: "build59",
		source_complete: false,
		deployed: false,
		verification_passed: false,
		device_accepted: false,
		integration_mode: "fixture",
		exclusions: ["Live claims"],
	},
};
function form() {
	const data = new FormData();
	for (const [key, value] of Object.entries({
		progress: "Mapped pending state",
		next: "Reproduce offline switch",
		evidence: "docs/qa.md\n\ndocs/switch.md",
		build: "build59",
	}))
		data.set(key, value);
	return data;
}
function event(
	version: number,
	from: Stage,
	to: Stage,
	reason: string,
): TaskHistoryEntry {
	return {
		id: `event-${version}`,
		actor: {
			user_id: "owner",
			email: "owner@example.test",
			display_name: "Reza",
		},
		change_type: from === to ? "UPDATED" : "STATUS_CHANGED",
		created_at: "2026-10-23 00:00:00",
		from_value: { stage: from },
		to_value: { stage: to, version },
		metadata: { workflow: "delivery", reason },
	};
}
describe("Task progress and return feedback", () => {
	it("sends versioned progress without status, assignments or completion flags", () => {
		const original = structuredClone(card);
		expect(progressCommand(card, form())).toEqual({
			version: 8,
			reason: "Mapped pending state",
			details: {
				next_action: "Reproduce offline switch",
				evidence: ["docs/qa.md", "docs/switch.md"],
				build_ref: "build59",
			},
		});
		expect(card).toEqual(original);
	});
	it("edits the blocker in place and requires owner, reason and next action", () => {
		const blocked = { ...card, stage: "BLOCKED" as const };
		const data = form();
		for (const key of ["owner", "blocker_reason", "blocker_next"]) {
			expect(() => progressCommand(blocked, data)).toThrow("required fields");
			data.set(
				key,
				key === "owner" ? "owner" : "Waiting for the assigned build",
			);
		}
		expect(progressCommand(blocked, data).blocker).toEqual({
			owner_user_id: "owner",
			reason: "Waiting for the assigned build",
			next_action: "Waiting for the assigned build",
		});
		expect(progressCommand(blocked, data)).not.toHaveProperty("stage");
	});
	it.each(["BACKLOG", "READY", "ACTIVE", "BLOCKED"] as Stage[])(
		"permits progress in %s only with write access",
		(stage) => {
			expect(canUpdateProgress(stage, true)).toBe(true);
			expect(canUpdateProgress(stage, false)).toBe(false);
		},
	);
	it.each(["REVIEW", "VERIFY", "DONE", "ARCHIVED"] as Stage[])(
		"keeps %s evidence/scope protected",
		(stage) => {
			expect(canUpdateProgress(stage, true)).toBe(false);
			expect(() => progressCommand({ ...card, stage }, form())).toThrow(
				"Return this task",
			);
		},
	);
	it("rejects blank progress, missing next action and oversized evidence before a write", () => {
		for (const key of ["progress", "next"]) {
			const data = form();
			data.set(key, " ");
			expect(() => progressCommand(card, data)).toThrow();
		}
		for (const text of [Array(21).fill("ref").join("\n"), "x".repeat(2001)]) {
			const data = form();
			data.set("evidence", text);
			expect(() => progressCommand(card, data)).toThrow("20 evidence");
		}
	});
	it("keeps latest return visible after newer progress, ordered by version even within one timestamp", () => {
		const rows = [
			event(4, "REVIEW", "ACTIVE", "Old return"),
			event(9, "ACTIVE", "ACTIVE", "New progress"),
			event(8, "VERIFY", "BLOCKED", "Add account-switch evidence"),
		];
		expect(taskUpdates(rows).map((row) => row.version)).toEqual([9, 8, 4]);
		const html = renderToStaticMarkup(<DeliveryTaskFeedback history={rows} />);
		expect(html.indexOf("Add account-switch evidence")).toBeLessThan(
			html.indexOf("<details>"),
		);
		expect(html.indexOf("Old return")).toBeGreaterThan(
			html.indexOf("<details>"),
		);
		expect(html).toContain("Reza");
		expect(html).toContain("Version 8");
		expect(html).toContain("New progress");
	});
	it("handles legacy history and removed actors without HTML injection or false return labels", () => {
		const row = event(10, "ACTIVE", "BLOCKED", "<script>alert(1)</script>");
		row.actor = null;
		expect(
			taskUpdates([
				{ ...row, metadata: null },
				{ ...row, metadata: "legacy" },
			]),
		).toEqual([]);
		const html = renderToStaticMarkup(<DeliveryTaskFeedback history={[row]} />);
		expect(html).not.toContain("Latest return for rework");
		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
		expect(html).toContain("Former member");
	});
	it("prepopulates blocker fields and omits viewers from its owner selector", () => {
		const blocked = {
			...card,
			stage: "BLOCKED" as const,
			blocker: {
				owner_user_id: "owner",
				reason: "Missing build",
				next_action: "Reza assigns build59",
			},
		};
		const html = renderToStaticMarkup(
			<DeliveryProgressForm
				card={blocked}
				people={[
					{
						user_id: "owner",
						role: "OWNER",
						display_name: "Reza",
						email: "owner@example.test",
					},
					{
						user_id: "observer",
						role: "VIEWER",
						display_name: null,
						email: "observer@example.test",
					},
				]}
				client={new DeliveryClient("synthetic-personal-key")}
				run={async () => {}}
			/>,
		);
		expect(html).toContain('value="owner" selected=""');
		expect(html).toContain("Missing build");
		expect(html).toContain("Reza assigns build59");
		expect(html).not.toContain('value="observer"');
		expect(html).not.toContain('name="stage"');
	});
});
