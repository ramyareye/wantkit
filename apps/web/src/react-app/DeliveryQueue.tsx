import { useCallback, useState } from "react";
import { DeliveryClient } from "./delivery-client";
import {
	DeliveryProgressForm,
	DeliveryTaskHistory,
} from "./DeliveryTaskUpdates";
import { canUpdateProgress } from "./delivery-task-updates";
import type {
	DeliveryCard,
	Person,
	Project,
	Queue,
	Stage,
	Workspace,
} from "./delivery-types";
import { useDeliveryResource } from "./use-delivery-resource";

export type RunDelivery = (action: () => Promise<unknown>) => Promise<void>;
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
export function Reference({ value }: { value: string }) {
	return /^https?:\/\//i.test(value) ? (
		<a href={value} target="_blank" rel="noreferrer">
			{value}
		</a>
	) : (
		<span>{value}</span>
	);
}
function TaskCard({
	card,
	workspace,
	people,
	projects,
	userId,
	canWrite,
	occupied,
	client,
	run,
}: {
	card: DeliveryCard;
	workspace: Workspace;
	people: Person[];
	projects: Project[];
	userId: string;
	canWrite: boolean;
	occupied: boolean;
	client: DeliveryClient;
	run: RunDelivery;
}) {
	const [editing, setEditing] = useState<"status" | "progress" | null>(null);
	const [stage, setStage] = useState<Stage | "">("");
	const reviewer =
		["OWNER", "ADMIN"].includes(workspace.role) ||
		card.reviewer_user_id === userId;
	const available = moves[card.stage].filter(
		(next) =>
			!(["VERIFY", "DONE"].includes(next) && !reviewer) &&
			!(
				next === "ACTIVE" &&
				(occupied || (!card.can_start && card.stage === "READY"))
			),
	);
	const person = (id: string | null) =>
		people.find((p) => p.user_id === id)?.display_name ||
		people.find((p) => p.user_id === id)?.email ||
		id ||
		"Unassigned";
	return (
		<article className="delivery-task">
			<div className="delivery-task__meta">
				<span>
					{projects.find((p) => p.id === card.project_id)?.name ??
						card.project_id ??
						"No project"}
				</span>
				<span>{card.effective_stage.toLowerCase()}</span>
			</div>
			<h3>{card.title}</h3>
			<p>{card.details.outcome || "Outcome has not been recorded."}</p>
			{card.details.next_action && (
				<p>
					<strong>Next:</strong> {card.details.next_action}
				</p>
			)}
			{card.blocker && card.effective_stage === "BLOCKED" && (
				<p className="delivery-notice">
					<strong>{person(card.blocker.owner_user_id)}:</strong>{" "}
					{card.blocker.reason}
					<br />
					Next: {card.blocker.next_action}
				</p>
			)}
			{card.readiness_issues.length > 0 && (
				<ul className="delivery-issues">
					{card.readiness_issues.map((issue) => (
						<li key={issue}>{issue.replaceAll("_", " ")}</li>
					))}
				</ul>
			)}
			<details>
				<summary>Brief, dependencies &amp; evidence</summary>
				<p>{card.details.scope || "No scope recorded."}</p>
				<p>Reviewer: {person(card.reviewer_user_id)}</p>
				<p>
					<Reference value={card.details.repository} />
				</p>
				<ul>
					{card.details.contract_refs.map((ref) => (
						<li key={ref}>
							<Reference value={ref} />
						</li>
					))}
				</ul>
				<ul>
					{card.details.acceptance_checks.map((check) => (
						<li key={check}>{check}</li>
					))}
				</ul>
				<p>
					{card.details.integration_mode === "fixture"
						? "Fixture integration"
						: "Live integration"}
					{card.details.exclusions.length > 0
						? ` · Excludes: ${card.details.exclusions.join(", ")}`
						: ""}
				</p>
				{card.depends_on.length ? (
					<ul>
						{card.depends_on.map((d) => (
							<li key={d.id}>
								{d.satisfied ? "Complete" : "Waiting"}: {d.title}
							</li>
						))}
					</ul>
				) : (
					<p>No dependencies.</p>
				)}
				<p>
					Source complete: {card.details.source_complete ? "yes" : "no"} ·
					Deployed: {card.details.deployed ? "yes" : "no"} · Verified:{" "}
					{card.details.verification_passed ? "yes" : "no"} · Device accepted:{" "}
					{card.details.device_accepted ? "yes" : "no"}
				</p>
				{card.details.build_ref && (
					<p>
						Build: <Reference value={card.details.build_ref} />
					</p>
				)}
				<ul>
					{card.details.evidence.map((ref) => (
						<li key={ref}>
							<Reference value={ref} />
						</li>
					))}
				</ul>
			</details>
			<DeliveryTaskHistory client={client} card={card} />
			{canUpdateProgress(card.stage, canWrite) && (
				<button
					type="button"
					className="text-button"
					onClick={() => setEditing(editing === "progress" ? null : "progress")}
				>
					{editing === "progress"
						? "Cancel progress update"
						: "Update progress"}
				</button>
			)}
			{editing === "progress" && canUpdateProgress(card.stage, canWrite) && (
				<DeliveryProgressForm {...{ card, people, client, run }} />
			)}
			{canWrite && available.length > 0 && (
				<button
					type="button"
					className="text-button"
					onClick={() => setEditing(editing === "status" ? null : "status")}
				>
					{editing === "status" ? "Cancel status change" : "Update status"}
				</button>
			)}
			{editing === "status" && (
				<form
					className="delivery-form"
					onSubmit={(event) => {
						event.preventDefault();
						const data = new FormData(event.currentTarget);
						const body: Record<string, unknown> = {
							version: card.version,
							stage,
							reason: String(data.get("reason")),
						};
						if (stage === "BLOCKED")
							body.blocker = {
								owner_user_id: data.get("owner"),
								reason: data.get("reason"),
								next_action: data.get("next"),
							};
						if (stage === "REVIEW")
							body.details = {
								source_complete: data.get("source") === "on",
								evidence: String(data.get("evidence"))
									.split("\n")
									.map((s) => s.trim())
									.filter(Boolean),
								build_ref: String(data.get("build")),
							};
						if (stage === "DONE")
							body.details = {
								verification_passed: data.get("verified") === "on",
								deployed: data.get("deployed") === "on",
								device_accepted: data.get("device") === "on",
							};
						void run(() =>
							client.mutate("PUT", `/v1/tasks/${card.id}/delivery`, body),
						);
					}}
				>
					<label>
						Move to
						<select
							aria-label="Move to"
							required
							value={stage}
							onChange={(e) => setStage(e.target.value as Stage)}
						>
							<option value="">Choose a status</option>
							{available.map((s) => (
								<option key={s} value={s}>
									{s.toLowerCase()}
								</option>
							))}
						</select>
					</label>
					<label>
						Reason
						<textarea name="reason" required maxLength={2000} />
					</label>
					{stage === "BLOCKED" && (
						<>
							<label>
								Blocker owner
								<select aria-label="Blocker owner" name="owner" required>
									<option value="">Choose a person</option>
									{people
										.filter((p) => p.role !== "VIEWER")
										.map((p) => (
											<option key={p.user_id} value={p.user_id}>
												{person(p.user_id)}
											</option>
										))}
								</select>
							</label>
							<label>
								Next action
								<input name="next" required maxLength={2000} />
							</label>
						</>
					)}
					{stage === "REVIEW" && (
						<>
							<label>
								Evidence references (one per line)
								<textarea
									name="evidence"
									required
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
							<label className="delivery-check">
								<input type="checkbox" name="source" required />
								Source is complete and ready for review
							</label>
						</>
					)}
					{stage === "DONE" && (
						<>
							<label className="delivery-check">
								<input type="checkbox" name="verified" required />
								Acceptance checks passed
							</label>
							<label className="delivery-check">
								<input
									type="checkbox"
									name="deployed"
									defaultChecked={card.details.deployed}
								/>
								This build is deployed
							</label>
							<label className="delivery-check">
								<input
									type="checkbox"
									name="device"
									defaultChecked={card.details.device_accepted}
								/>
								Accepted on device
							</label>
						</>
					)}
					{(stage === "ACTIVE" || stage === "BACKLOG") && (
						<p className="delivery-muted">
							Reopening clears previous completion and verification evidence.
						</p>
					)}
					<button className="button button--primary" disabled={!stage}>
						Save status
					</button>
				</form>
			)}
		</article>
	);
}
export function DeliveryQueue({
	client,
	workspace,
	people,
	projects,
	userId,
	refresh,
	canWrite,
	run,
}: {
	client: DeliveryClient;
	workspace: Workspace;
	people: Person[];
	projects: Project[];
	userId: string;
	refresh: number;
	canWrite: boolean;
	run: RunDelivery;
}) {
	const [person, setPerson] = useState(userId);
	const load = useCallback(
		() =>
			client.get<Queue>(
				`/v1/workspaces/${workspace.id}/delivery/queue?user_id=${person}`,
			),
		[client, workspace.id, person],
	);
	const { data, error } = useDeliveryResource(load, `${person}:${refresh}`);
	return (
		<section aria-label="Task queue">
			<div className="delivery-section-heading">
				<div>
					<p className="eyebrow">A little focus, every day</p>
					<h2>One thing in motion.</h2>
				</div>
				<label>
					Queue for
					<select
						aria-label="Queue for"
						value={person}
						onChange={(e) => setPerson(e.target.value)}
					>
						{people
							.filter((p) => p.role !== "VIEWER")
							.map((p) => (
								<option key={p.user_id} value={p.user_id}>
									{p.display_name || p.email}
								</option>
							))}
					</select>
				</label>
			</div>
			{error ? (
				<p role="alert">{error}</p>
			) : !data ? (
				<p role="status">Loading the queue...</p>
			) : (
				<>
					{data.active_conflict && (
						<p className="delivery-notice" role="alert">
							More than one active task needs replanning. Existing assignments
							are preserved.
						</p>
					)}
					<div className="delivery-queue-grid">
						{(
							[
								[
									"In motion",
									data.active,
									"No active task. Start one of the ready alternatives.",
								],
								[
									"Ready alternatives",
									data.ready_alternatives,
									"No ready alternatives yet.",
								],
								["Blocked", data.blocked, "Nothing blocked."],
								["Review", data.review, "Nothing awaiting review."],
								["Verify", data.verify, "Nothing awaiting verification."],
							] as [string, DeliveryCard[], string][]
						).map(([title, cards, empty]) => (
							<section className="delivery-lane" key={title}>
								<h3>
									{title}{" "}
									<span>
										{title === "Ready alternatives"
											? `${data.ready_alternatives.length}/2`
											: cards.length}
									</span>
								</h3>
								{title === "Ready alternatives" && (
									<p className="delivery-muted">
										{data.missing_ready_alternatives
											? `${data.missing_ready_alternatives} more ready alternative${data.missing_ready_alternatives > 1 ? "s" : ""} needed.`
											: "Two alternatives are ready."}
										{data.ready_count > 2
											? ` ${data.ready_count} ready in total.`
											: ""}
									</p>
								)}
								{cards.length ? (
									cards.map((card) => (
										<TaskCard
											key={`${card.id}:${card.version}`}
											{...{
												card,
												workspace,
												people,
												projects,
												userId,
												canWrite,
												client,
												run,
											}}
											occupied={data.active.some((c) => c.id !== card.id)}
										/>
									))
								) : (
									<p className="delivery-empty">{empty}</p>
								)}
							</section>
						))}
					</div>
				</>
			)}
		</section>
	);
}
