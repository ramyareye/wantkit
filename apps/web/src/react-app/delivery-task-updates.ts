import type { DeliveryCard, Stage, TaskHistoryEntry } from "./delivery-types";

export function canUpdateProgress(stage: Stage, canWrite: boolean) {
	return canWrite && ["BACKLOG", "READY", "ACTIVE", "BLOCKED"].includes(stage);
}
export function progressCommand(card: DeliveryCard, data: FormData) {
	if (!canUpdateProgress(card.stage, true))
		throw new Error(
			"Return this task to implementation before updating progress.",
		);
	const value = (name: string, required = false) => {
		const text = String(data.get(name) ?? "").trim();
		if ((required && !text) || text.length > 2000)
			throw new Error(
				"Complete the required fields using at most 2000 characters each.",
			);
		return text;
	};
	const evidence = String(data.get("evidence") ?? "")
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);
	if (evidence.length > 20 || evidence.some((s) => s.length > 2000))
		throw new Error(
			"Use at most 20 evidence references, with 2000 characters per reference.",
		);
	// Only progress fields: never resend status, assignments or review/verification flags.
	return {
		version: card.version,
		reason: value("progress", true),
		details: {
			next_action: value("next", true),
			evidence,
			build_ref: value("build"),
		},
		...(card.stage === "BLOCKED"
			? {
					blocker: {
						owner_user_id: value("owner", true),
						reason: value("blocker_reason", true),
						next_action: value("blocker_next", true),
					},
				}
			: {}),
	};
}
function record(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}
export function taskUpdates(history: TaskHistoryEntry[]) {
	return history
		.flatMap((entry) => {
			const metadata = record(entry.metadata);
			const from = record(entry.from_value);
			const to = record(entry.to_value);
			if (
				metadata.workflow !== "delivery" ||
				typeof metadata.reason !== "string" ||
				!metadata.reason.trim()
			)
				return [];
			const version =
				typeof to.version === "number" && Number.isSafeInteger(to.version)
					? to.version
					: 0;
			return [
				{
					...entry,
					reason: metadata.reason,
					version,
					returned:
						["REVIEW", "VERIFY"].includes(String(from.stage)) &&
						["ACTIVE", "BLOCKED", "BACKLOG"].includes(String(to.stage)),
					from: typeof from.stage === "string" ? from.stage.toLowerCase() : "",
					to: typeof to.stage === "string" ? to.stage.toLowerCase() : "",
				},
			];
		})
		.sort(
			(a, b) =>
				b.version - a.version ||
				b.created_at.localeCompare(a.created_at) ||
				b.id.localeCompare(a.id),
		);
}
