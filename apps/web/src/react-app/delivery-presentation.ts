import type { DeliveryCard, Stage } from "./delivery-types";

export const stageLabel: Record<Stage, string> = {
	BACKLOG: "Backlog",
	READY: "Ready",
	ACTIVE: "In progress",
	BLOCKED: "Blocked",
	REVIEW: "Needs review",
	VERIFY: "Checking",
	DONE: "Done",
	ARCHIVED: "Archived",
};

const moves: Record<Stage, Stage[]> = {
	BACKLOG: ["READY", "BLOCKED"],
	READY: ["ACTIVE", "BLOCKED", "BACKLOG"],
	ACTIVE: ["REVIEW", "BLOCKED", "BACKLOG"],
	BLOCKED: ["READY", "BACKLOG"],
	REVIEW: ["VERIFY", "ACTIVE", "BLOCKED"],
	VERIFY: ["DONE", "ACTIVE", "BLOCKED"],
	DONE: [],
	ARCHIVED: [],
};

export function availableTaskMoves(
	card: DeliveryCard,
	role: string,
	userId: string,
	occupied: boolean,
) {
	const reviewer =
		card.assignee_user_id !== userId &&
		(["OWNER", "ADMIN"].includes(role) || card.reviewer_user_id === userId);
	return moves[card.stage].filter(
		(next) =>
			!(["VERIFY", "DONE"].includes(next) && !reviewer) &&
			!(
				next === "ACTIVE" &&
				(occupied || (card.stage === "READY" && !card.can_start))
			),
	);
}

export function taskActionLabel(from: Stage, to: Stage) {
	if (to === "ACTIVE")
		return from === "READY" ? "Start task" : "Return to work";
	if (to === "READY")
		return from === "BLOCKED" ? "Clear blocker" : "Make ready";
	if (to === "BLOCKED") return "I'm blocked";
	if (to === "REVIEW") return "Send for review";
	if (to === "VERIFY") return "Accept review";
	if (to === "DONE") return "Mark complete";
	return "Move to backlog";
}
