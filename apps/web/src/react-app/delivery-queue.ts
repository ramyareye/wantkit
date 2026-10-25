import type { DeliveryClient } from "./delivery-client";
import type { DeliveryCard, Queue, Stage, Task } from "./delivery-types";

export async function loadTaskQueue(
	client: Pick<DeliveryClient, "get" | "all">,
	workspaceId: string,
	person: string,
) {
	const root = `/v1/workspaces/${workspaceId}`;
	const queue = await client.get<Queue>(
		`${root}/delivery/queue?user_id=${person}`,
	);
	if (queue.ready_count <= queue.ready_alternatives.length) return queue;
	// The focus endpoint suggests two alternatives. A task list must also retain
	// the other ready tasks, including one the person has just unblocked.
	const tasks = await client.all<Task & { delivery_state: Stage | null }>(
		`${root}/tasks?assignee_id=${person}`,
		"tasks",
	);
	const known = new Set(queue.ready_alternatives.map((card) => card.id));
	const missing = tasks.filter(
		(task) => task.delivery_state === "READY" && !known.has(task.id),
	);
	const extra: DeliveryCard[] = [];
	for (let index = 0; index < missing.length; index += 5) {
		const batch = await Promise.all(
			missing
				.slice(index, index + 5)
				.map((task) =>
					client.get<DeliveryCard>(`/v1/tasks/${task.id}/delivery`),
				),
		);
		extra.push(
			...batch.filter(
				(card) => card.can_start && card.assignee_user_id === person,
			),
		);
	}
	return {
		...queue,
		ready_alternatives: [...queue.ready_alternatives, ...extra],
	};
}

export function queueCards(queue?: Queue) {
	return queue
		? [
				...new Map(
					[
						...queue.active,
						...queue.review,
						...queue.verify,
						...queue.blocked,
						...queue.ready_alternatives,
					].map((card) => [card.id, card]),
				).values(),
			]
		: [];
}
