import { useCallback } from "react";
import type { DeliveryClient } from "./delivery-client";
import type { DeliveryCard, Person, TaskHistoryEntry } from "./delivery-types";
import type { RunDelivery } from "./DeliveryQueue";
import { progressCommand, taskUpdates } from "./delivery-task-updates";
import { useDeliveryResource } from "./use-delivery-resource";

export function DeliveryProgressForm({
	card,
	people,
	client,
	run,
}: {
	card: DeliveryCard;
	people: Person[];
	client: DeliveryClient;
	run: RunDelivery;
}) {
	return (
		<form
			className="delivery-form"
			aria-label="Update task progress"
			onSubmit={(event) => {
				event.preventDefault();
				const data = new FormData(event.currentTarget);
				void run(() =>
					client.mutate(
						"PUT",
						`/v1/tasks/${card.id}/delivery`,
						progressCommand(card, data),
					),
				);
			}}
		>
			<p>
				Status stays {card.stage.toLowerCase()}. This update is saved in the
				task history.
			</p>
			<label>
				Progress note
				<textarea name="progress" required maxLength={2000} />
			</label>
			<label>
				Task next action
				<input
					name="next"
					required
					maxLength={2000}
					defaultValue={card.details.next_action}
				/>
			</label>
			<label>
				Evidence references (one per line)
				<textarea
					name="evidence"
					maxLength={42000}
					defaultValue={card.details.evidence.join("\n")}
				/>
			</label>
			<label>
				Build / commit reference
				<input
					name="build"
					maxLength={2000}
					defaultValue={card.details.build_ref}
				/>
			</label>
			{card.stage === "BLOCKED" && (
				<>
					<label>
						Blocker owner
						<select
							name="owner"
							required
							defaultValue={card.blocker?.owner_user_id ?? ""}
						>
							<option value="">Choose a person</option>
							{people
								.filter((p) => p.role !== "VIEWER")
								.map((p) => (
									<option key={p.user_id} value={p.user_id}>
										{p.display_name || p.email}
									</option>
								))}
						</select>
					</label>
					<label>
						Blocker reason
						<textarea
							name="blocker_reason"
							required
							maxLength={2000}
							defaultValue={card.blocker?.reason}
						/>
					</label>
					<label>
						Blocker next action
						<input
							name="blocker_next"
							required
							maxLength={2000}
							defaultValue={card.blocker?.next_action}
						/>
					</label>
				</>
			)}
			<button className="button button--primary">Save progress</button>
		</form>
	);
}
export function DeliveryTaskFeedback({
	history,
}: {
	history: TaskHistoryEntry[];
}) {
	const updates = taskUpdates(history);
	const returned = updates.find((entry) => entry.returned);
	const actor = (entry: TaskHistoryEntry) =>
		entry.actor?.display_name ||
		entry.actor?.email ||
		entry.actor?.user_id ||
		"Former member";
	return (
		<>
			{returned && (
				<div className="delivery-notice" aria-label="Latest task return">
					<strong>Latest return for rework</strong>
					<p>{returned.reason}</p>
					<small>
						{actor(returned)} · {returned.created_at} UTC · {returned.from} →{" "}
						{returned.to} · Version {returned.version}
					</small>
				</div>
			)}
			<details>
				<summary>Task updates &amp; return reasons</summary>
				{updates.length ? (
					<ol>
						{updates.map((entry) => (
							<li key={entry.id}>
								<strong>
									{entry.returned
										? "Returned for rework"
										: entry.from !== entry.to
											? `${entry.from} → ${entry.to}`
											: "Progress update"}
								</strong>
								<p>{entry.reason}</p>
								<small>
									{actor(entry)} · {entry.created_at} UTC · Version{" "}
									{entry.version}
								</small>
							</li>
						))}
					</ol>
				) : (
					<p>No delivery updates recorded yet.</p>
				)}
			</details>
		</>
	);
}
export function DeliveryTaskHistory({
	client,
	card,
}: {
	client: DeliveryClient;
	card: DeliveryCard;
}) {
	const load = useCallback(
		() =>
			client.all<TaskHistoryEntry>(`/v1/tasks/${card.id}/history`, "history"),
		[client, card.id],
	);
	const { data, error } = useDeliveryResource(
		load,
		`${card.id}:${card.version}`,
	);
	return error ? (
		<p role="alert">
			Could not load task feedback: {error} Refresh current records to try
			again.
		</p>
	) : data ? (
		<DeliveryTaskFeedback history={data} />
	) : (
		<p role="status">Loading task feedback...</p>
	);
}
