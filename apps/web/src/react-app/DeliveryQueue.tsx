import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DeliveryClient } from "./delivery-client";
import {
	DeliveryProgressForm,
	DeliveryTaskHistory,
} from "./DeliveryTaskUpdates";
import { canUpdateProgress } from "./delivery-task-updates";
import { loadTaskQueue, queueCards } from "./delivery-queue";
import {
	availableTaskMoves,
	stageLabel,
	taskActionLabel,
} from "./delivery-presentation";
import type {
	DeliveryCard,
	Person,
	Project,
	Stage,
	Workspace,
} from "./delivery-types";
import { useDeliveryResource } from "./use-delivery-resource";

export type RunDelivery = (action: () => Promise<unknown>) => Promise<void>;
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
	const available = availableTaskMoves(card, workspace.role, userId, occupied);
	const primary = available.find(
		(next) => !["BACKLOG", "BLOCKED"].includes(next),
	);
	const openAction = (next: Stage) => {
		setStage(next);
		setEditing("status");
	};
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
				<span
					className={`delivery-status delivery-status--${card.effective_stage.toLowerCase()}`}
				>
					{stageLabel[card.effective_stage]}
				</span>
			</div>
			<h3 id="delivery-task-title">{card.title}</h3>
			{card.details.outcome && card.details.outcome !== card.title && <p>{card.details.outcome}</p>}
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
			{canWrite && !editing && (
				<div className="delivery-task-actions">
					{primary && (
						<button
							type="button"
							className="button button--primary"
							onClick={() => {
								if (card.stage === "READY" && primary === "ACTIVE") {
									void run(() =>
										client.mutate("PUT", `/v1/tasks/${card.id}/delivery`, {
											version: card.version,
											stage: "ACTIVE",
											reason: "Started task.",
										}),
									);
								} else openAction(primary);
							}}
						>
							{taskActionLabel(card.stage, primary)}
						</button>
					)}
					{canUpdateProgress(card.stage, canWrite) && (
						<button
							type="button"
							className="button button--secondary"
							onClick={() => setEditing("progress")}
						>
							Post update
						</button>
					)}
					{available.includes("BLOCKED") && (
						<button
							type="button"
							className="text-button"
							onClick={() => openAction("BLOCKED")}
						>
							I'm blocked
						</button>
					)}
					{available.some((next) => next !== primary && next !== "BLOCKED") && (
						<details className="delivery-more">
							<summary>More actions</summary>
							<div className="delivery-actions">
								{available
									.filter((next) => next !== primary && next !== "BLOCKED")
									.map((next) => (
										<button
											type="button"
											className="text-button"
											key={next}
											onClick={() => openAction(next)}
										>
											{taskActionLabel(card.stage, next)}
										</button>
									))}
							</div>
						</details>
					)}
				</div>
			)}
			{card.stage === "READY" && occupied && (
				<p className="delivery-muted">
					Finish or pause your current task before starting another.
				</p>
			)}
			{card.stage === "REVIEW" && !available.includes("VERIFY") && (
				<p className="delivery-muted">
					Waiting for {person(card.reviewer_user_id)} to review.
				</p>
			)}
			{editing && (
				<button
					type="button"
					className="text-button delivery-cancel"
					onClick={() => {
						setEditing(null);
						setStage("");
					}}
				>
					Cancel
				</button>
			)}
			{!editing && (
				<details>
					<summary>Details &amp; evidence</summary>
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
			)}
			{!editing && <DeliveryTaskHistory client={client} card={card} />}
			{editing === "progress" && canUpdateProgress(card.stage, canWrite) && (
				<DeliveryProgressForm {...{ card, people, client, run }} />
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
					<h4>{stage && taskActionLabel(card.stage, stage)}</h4>
					<label>
						{stage === "BLOCKED"
							? "What's blocking you?"
							: stage === "REVIEW"
								? "What is ready to review?"
								: "Note"}
						<textarea name="reason" required maxLength={2000} />
					</label>
					{stage === "BLOCKED" && (
						<>
							<label>
								Who can help?
								<select
									aria-label="Blocker owner"
									name="owner"
									required
									defaultValue={card.assignee_user_id ?? ""}
								>
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
								What needs to happen next?
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
								This work is ready for review
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
					{((stage === "ACTIVE" && card.stage !== "READY") ||
						stage === "BACKLOG") && (
						<p className="delivery-muted">
							Reopening clears previous completion and verification evidence.
						</p>
					)}
					<button className="button button--primary" disabled={!stage}>
						{stage ? taskActionLabel(card.stage, stage) : "Save"}
					</button>
				</form>
			)}
		</article>
	);
}
function TaskDialog({
	children,
	close,
	disabled,
	error,
}: {
	children: React.ReactNode;
	close: () => void;
	disabled: boolean;
	error: string;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const dialog = ref.current;
		const previousFocus = document.activeElement;
		dialog?.showModal();
		return () => {
			dialog?.close();
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
				previousFocus.focus();
		};
	}, []);
	return createPortal(
		<div className="delivery-page delivery-dialog-root" lang="en" dir="ltr">
			<dialog
				ref={ref}
				className="delivery-task-dialog"
				aria-labelledby="delivery-task-title"
				onCancel={(event) => {
					event.preventDefault();
					close();
				}}
			>
				<div className="delivery-dialog-bar">
					<span>Task details</span>
					<button
						type="button"
						className="text-button"
						onClick={close}
						aria-label="Close task"
					>
						Close <span aria-hidden="true">×</span>
					</button>
				</div>
				{error && (
					<p role="alert" className="delivery-notice">
						{error} Close this task to refresh or retry the action.
					</p>
				)}
				<fieldset className="delivery-content" disabled={disabled}>
					{children}
				</fieldset>
			</dialog>
		</div>,
		document.body,
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
	locked = false,
	errorMessage = "",
}: {
	client: DeliveryClient;
	workspace: Workspace;
	people: Person[];
	projects: Project[];
	userId: string;
	refresh: number;
	canWrite: boolean;
	run: RunDelivery;
	locked?: boolean;
	errorMessage?: string;
}) {
	const [person, setPerson] = useState(userId);
	const [selected, setSelected] = useState<string | null>(null);
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");
	const load = useCallback(
		() => loadTaskQueue(client, workspace.id, person),
		[client, workspace.id, person],
	);
	const { data, error, loading } = useDeliveryResource(
		load,
		`${person}:${refresh}`,
		true,
	);
	const cards = queueCards(data);
	const groups = [
		{ id: "all", name: "All tasks", cards },
		{ id: "active", name: "In progress", cards: data?.active ?? [] },
		{ id: "ready", name: "Ready", cards: data?.ready_alternatives ?? [] },
		{
			id: "review",
			name: "Review",
			cards: [...(data?.review ?? []), ...(data?.verify ?? [])],
		},
		{ id: "blocked", name: "Blocked", cards: data?.blocked ?? [] },
	];
	const visible = (
		groups.find((group) => group.id === filter)?.cards ?? cards
	).filter((card) =>
		`${card.title} ${projects.find((p) => p.id === card.project_id)?.name ?? ""}`
			.toLowerCase()
			.includes(search.toLowerCase()),
	);
	const current = cards.find((card) => card.id === selected);
	return (
		<section aria-label="Task queue">
			<div className="delivery-section-heading">
				<div>
					<h2>Tasks</h2>
				</div>
				<label className="delivery-assignee">
					Assignee
					<select
						aria-label="Queue for"
						value={person}
						disabled={loading}
						onChange={(event) => {
							setPerson(event.target.value);
							setSelected(null);
							setFilter("all");
							setSearch("");
						}}
					>
						{people
							.filter((p) => p.role !== "VIEWER")
							.map((p) => (
								<option key={p.user_id} value={p.user_id}>
									{p.user_id === userId
										? "My tasks"
										: p.display_name || p.email}
								</option>
							))}
					</select>
				</label>
			</div>
			{error ? (
				<p role="alert">{error}</p>
			) : !data ? (
				<p role="status">Loading tasks...</p>
			) : (
				<fieldset className="delivery-content" disabled={loading}>
					{data.active_conflict && (
						<p className="delivery-notice" role="alert">
							You have more than one task in progress. Pause one before starting
							something else.
						</p>
					)}
					<div className="delivery-list-toolbar">
						<div
							className="delivery-filters"
							role="group"
							aria-label="Filter tasks"
						>
							{groups.map((group) => (
								<button
									type="button"
									key={group.id}
									aria-pressed={filter === group.id}
									onClick={() => setFilter(group.id)}
								>
									{group.name}
									<span>{group.cards.length}</span>
								</button>
							))}
						</div>
						<input
							type="search"
							aria-label="Search tasks"
							placeholder="Search tasks…"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</div>
					<div className="delivery-task-list" aria-label="Tasks">
						{visible.map((card) => (
							<button
								type="button"
								className="delivery-task-row"
								key={card.id}
								onClick={(event) => {
									event.currentTarget.focus();
									setSelected(card.id);
								}}
								aria-haspopup="dialog"
							>
								<span
									aria-hidden="true"
									className={`delivery-status-dot delivery-status-dot--${card.effective_stage.toLowerCase()}`}
								/>
								<span className="delivery-row-title">
									{card.title}
									<small>
										{projects.find((p) => p.id === card.project_id)?.name ??
											"No project"}
									</small>
								</span>
								<span
									className={`delivery-status delivery-status--${card.effective_stage.toLowerCase()}`}
								>
									{stageLabel[card.effective_stage]}
								</span>
								<span className="delivery-row-chevron" aria-hidden="true">
									›
								</span>
							</button>
						))}
						{!visible.length && (
							<div className="delivery-list-empty">
								<strong>
									{search
										? "No matching tasks"
										: filter === "all"
											? "No tasks here yet"
											: `Nothing ${filter === "review" ? "to review" : filter === "ready" ? "ready" : filter === "active" ? "in progress" : "blocked"}`}
								</strong>
								<p>
									{search
										? "Try a different title or project."
										: filter === "all"
											? "Tasks assigned to this person will appear here."
											: "Choose All tasks to see the rest of your queue."}
								</p>
							</div>
						)}
					</div>
					{data.ready_count > data.ready_alternatives.length && (
						<p className="delivery-muted">
							Showing your next {data.ready_alternatives.length} ready tasks.{" "}
							{data.ready_count} ready in total.
						</p>
					)}
					{current && (
						<TaskDialog
							close={() => setSelected(null)}
							disabled={locked || loading}
							error={errorMessage}
						>
							<TaskCard
								key={`${current.id}:${current.version}`}
								card={current}
								{...{
									workspace,
									people,
									projects,
									userId,
									canWrite,
									client,
									run,
								}}
								occupied={data.active.some((card) => card.id !== current.id)}
							/>
						</TaskDialog>
					)}
				</fieldset>
			)}
		</section>
	);
}
