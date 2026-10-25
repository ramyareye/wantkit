import { useCallback, useState } from "react";
import {
	addDays,
	approvalCommand,
	canApprove,
	currentWeek,
	DeliveryClient,
	hours,
} from "./delivery-client";
import { Reference, type RunDelivery } from "./DeliveryQueue";
import type {
	Entry,
	History,
	Person,
	Project,
	Settings,
	Task,
	Week,
	Workspace,
} from "./delivery-types";
import { useDeliveryResource } from "./use-delivery-resource";

function EntryForm({
	week,
	client,
	workspace,
	projects,
	editing,
	run,
	close,
}: {
	week: Week;
	client: DeliveryClient;
	workspace: Workspace;
	projects: Project[];
	editing?: Entry;
	run: RunDelivery;
	close: () => void;
}) {
	const [project, setProject] = useState(editing?.project_id ?? "");
	const [task, setTask] = useState(editing?.task_id ?? "");
	const load = useCallback(
		() =>
			project
				? client.all<Task>(
						`/v1/workspaces/${workspace.id}/tasks?project_id=${project}`,
						"tasks",
					)
				: Promise.resolve([]),
		[client, workspace.id, project],
	);
	const { data: tasks, error } = useDeliveryResource(load, project);
	return (
		<form
			className="delivery-form delivery-entry-form"
			onSubmit={(event) => {
				event.preventDefault();
				const form = event.currentTarget;
				const data = new FormData(form);
				void run(async () => {
					await client.mutate(
						"POST",
						`/v1/workspaces/${workspace.id}/time/weeks/${week.id}/actions`,
						{
							action: "save_entry",
							version: week.version,
							...(editing ? { entry_id: editing.id } : {}),
							entry: {
								project_id: project,
								task_id: data.get("task"),
								work_date: data.get("date"),
								activity: data.get("activity"),
								minutes: Number(data.get("minutes")),
								note: data.get("note"),
								evidence_ref: data.get("evidence") || null,
							},
						},
					);
					close();
				});
			}}
		>
			<h3>{editing ? "Edit time entry" : "Log time"}</h3>
			<div className="delivery-fields">
				<label>
					Project
					<select
						aria-label="Project"
						required
						value={project}
						onChange={(e) => {
							setProject(e.target.value);
							setTask("");
						}}
					>
						<option value="">Choose a project</option>
						{projects.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</label>
				<label>
					Task
					<select
						aria-label="Task"
						name="task"
						required
						value={task}
						onChange={(e) => setTask(e.target.value)}
						disabled={!tasks || tasks.length === 0}
					>
						<option value="">
							{project ? "Choose a task" : "Choose a project first"}
						</option>
						{tasks?.map((t) => (
							<option key={t.id} value={t.id}>
								{t.title}
							</option>
						))}
					</select>
				</label>
				<label>
					Work date
					<input
						name="date"
						type="date"
						required
						min={week.week_start_date}
						max={addDays(week.week_start_date, 6)}
						defaultValue={editing?.work_date ?? week.week_start_date}
					/>
				</label>
				<label>
					Minutes
					<input
						name="minutes"
						type="number"
						required
						min={1}
						max={1440}
						step={1}
						defaultValue={editing?.minutes}
						placeholder="e.g. 90"
					/>
				</label>
				<label>
					Activity
					<select
						aria-label="Activity"
						name="activity"
						defaultValue={editing?.activity ?? "development"}
					>
						{["development", "qa", "setup", "research", "rework", "review"].map(
							(a) => (
								<option key={a}>{a}</option>
							),
						)}
					</select>
				</label>
			</div>
			{error && <p role="alert">{error}</p>}
			<label>
				What did you work on?
				<textarea
					name="note"
					required
					maxLength={1000}
					defaultValue={editing?.note}
				/>
			</label>
			<details className="delivery-optional-fields">
				<summary>Add a link (optional)</summary>
				<label>
					Evidence link (optional)
					<input
						name="evidence"
						type="url"
						pattern="https?://.*"
						maxLength={2000}
						defaultValue={editing?.evidence_ref ?? ""}
					/>
				</label>
			</details>
			<div className="delivery-actions">
				<button className="button button--primary" disabled={!tasks?.length}>
					Save time
				</button>
				<button type="button" className="text-button" onClick={close}>
					Cancel
				</button>
			</div>
		</form>
	);
}
function WeekDetail({
	week,
	client,
	workspace,
	people,
	projects,
	userId,
	approver,
	canWrite,
	run,
}: {
	week: Week;
	client: DeliveryClient;
	workspace: Workspace;
	people: Person[];
	projects: Project[];
	userId: string;
	approver: boolean;
	canWrite: boolean;
	run: RunDelivery;
}) {
	const [entry, setEntry] = useState<Entry | "new" | null>(null);
	const [minutes, setMinutes] = useState<Record<string, string>>({});
	const [reason, setReason] = useState("");
	const [confirm, setConfirm] = useState(false);
	const [overCap, setOverCap] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [removing, setRemoving] = useState<Entry | null>(null);
	const root = `/v1/workspaces/${workspace.id}/time/weeks/${week.id}`;
	const loadHistory = useCallback(
		() =>
			showHistory
				? client.all<History>(`${root}/history`, "events")
				: Promise.resolve([]),
		[client, root, showHistory],
	);
	const history = useDeliveryResource(
		loadHistory,
		`${week.version}:${showHistory}`,
	);
	const loadTasks = useCallback(
		() => client.all<Task>(`/v1/workspaces/${workspace.id}/tasks`, "tasks"),
		[client, workspace.id],
	);
	const taskNames = useDeliveryResource(loadTasks, workspace.id);
	const own = week.user_id === userId;
	const review = canWrite && canApprove(week, userId, approver);
	const edit = canWrite && own && week.state === "draft";
	const action = (body: Record<string, unknown>) =>
		run(() =>
			client.mutate("POST", `${root}/actions`, {
				...body,
				version: week.version,
			}),
		);
	const person = (id: string) =>
		people.find((p) => p.user_id === id)?.display_name ||
		people.find((p) => p.user_id === id)?.email ||
		id;
	const total = week.entries.reduce((n, e) => n + e.minutes, 0);
	const approved = week.approval?.entries.reduce(
		(n, e) => n + e.approved_minutes,
		0,
	);
	const totals = [...new Set(week.entries.map((e) => e.project_id))]
		.map((id) => projects.find((p) => p.id === id) ?? { id, name: id })
		.map((p) => ({
			...p,
			logged: week.entries
				.filter((e) => e.project_id === p.id)
				.reduce((n, e) => n + e.minutes, 0),
			approved: week.approval?.entries
				.filter(
					(e) =>
						week.entries.find((original) => original.id === e.entry_id)
							?.project_id === p.id,
				)
				.reduce((n, e) => n + e.approved_minutes, 0),
		}));
	return (
		<article
			className="delivery-week"
			aria-label={`Week for ${person(week.user_id)}`}
		>
			<div className="delivery-section-heading">
				<div>
					<p className="eyebrow">{person(week.user_id)}</p>
					<h3>
						{week.week_start_date} - {addDays(week.week_start_date, 6)}
					</h3>
					<p className="delivery-muted">
						{week.timezone} · Revision {week.revision} ·{" "}
						{week.state.replaceAll("_", " ")}
					</p>
				</div>
				<div className="delivery-actions">
					{edit && !entry && (
						<button
							type="button"
							className="button button--primary"
							onClick={() => setEntry("new")}
						>
							Log time
						</button>
					)}
					<div className="delivery-totals">
						<strong>{hours(total)}</strong>
						<span>{week.submission ? "submitted" : "logged"}</span>
						<strong>
							{approved === undefined ? "Pending" : hours(approved)}
						</strong>
						<span>approved</span>
					</div>
				</div>
			</div>
			{edit && entry && (
				<EntryForm
					key={typeof entry === "string" ? "new" : entry.id}
					{...{ week, client, workspace, projects, run }}
					editing={entry === "new" ? undefined : entry}
					close={() => setEntry(null)}
				/>
			)}
			<div className="delivery-table-wrap">
				<table>
					<caption>Entries across all projects</caption>
					<thead>
						<tr>
							<th>Date / project / task</th>
							<th>Work</th>
							<th>{week.submission ? "Submitted" : "Logged"}</th>
							<th>Approved</th>
							{edit && <th>Actions</th>}
						</tr>
					</thead>
					<tbody>
						{week.entries.map((e) => (
							<tr key={e.id}>
								<td data-label="Date / project / task">
									{e.work_date}
									<br />
									<strong>
										{projects.find((p) => p.id === e.project_id)?.name ??
											e.project_id}
									</strong>
									<br />
									<span>
										{taskNames.data?.find((t) => t.id === e.task_id)?.title ??
											e.task_id}
									</span>
								</td>
								<td data-label="Work">
									{e.activity}
									<br />
									{e.note}
									{e.evidence_ref && (
										<p>
											<Reference value={e.evidence_ref} />
										</p>
									)}
								</td>
								<td data-label={week.submission ? "Submitted" : "Logged"}>
									{hours(e.minutes)}
								</td>
								<td data-label="Approved">
									{review ? (
										<label>
											<span className="delivery-muted">
												Approved minutes: {e.note}
											</span>
											<input
												type="number"
												min={0}
												max={e.minutes}
												step={1}
												required
												aria-label={`Approved minutes: ${e.note}`}
												value={minutes[e.id] ?? String(e.minutes)}
												onChange={(event) =>
													setMinutes({ ...minutes, [e.id]: event.target.value })
												}
											/>
										</label>
									) : week.approval ? (
										hours(
											week.approval.entries.find((a) => a.entry_id === e.id)
												?.approved_minutes ?? 0,
										)
									) : (
										"Pending"
									)}
								</td>
								{edit && (
									<td data-label="Actions">
										<button
											type="button"
											className="text-button"
											onClick={() => setEntry(e)}
										>
											Edit
										</button>
										<button
											type="button"
											className="text-button"
											onClick={() => {
												setRemoving(e);
												setReason("");
											}}
										>
											Remove
										</button>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
				{week.entries.length === 0 && (
					<p className="delivery-empty">
						No time logged yet. Add actual human work, including QA, setup and
						rework.
					</p>
				)}
			</div>
			{removing && (
				<form
					className="delivery-form delivery-entry-form"
					aria-label="Remove time entry"
					onSubmit={(event) => {
						event.preventDefault();
						void run(async () => {
							await client.mutate("POST", `${root}/actions`, {
								action: "remove_entry",
								entry_id: removing.id,
								version: week.version,
								reason,
							});
							setRemoving(null);
						});
					}}
				>
					<h4>Remove this entry?</h4>
					<p>
						{removing.note} · {hours(removing.minutes)}
					</p>
					<label>
						Reason for removal
						<textarea
							required
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							maxLength={1000}
						/>
					</label>
					<div className="delivery-actions">
						<button
							className="button button--primary"
							disabled={!reason.trim()}
						>
							Remove entry
						</button>
						<button
							type="button"
							className="text-button"
							onClick={() => {
								setRemoving(null);
								setReason("");
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			)}
			{totals.length > 0 && (
				<details className="delivery-optional-fields">
					<summary>Totals by project</summary>
					<ul className="delivery-project-totals">
						{totals
							.filter((p) => p.logged > 0)
							.map((p) => (
								<li key={p.id}>
									<strong>{p.name}</strong> {hours(p.logged)}{" "}
									{week.submission ? "submitted" : "logged"} ·{" "}
									{p.approved === undefined
										? "approval pending"
										: `${hours(p.approved)} approved`}
								</li>
							))}
					</ul>
				</details>
			)}
			{week.approval?.reason && (
				<p className="delivery-notice">
					Approval reason: {week.approval.reason}
				</p>
			)}
			{week.approval && (
				<p className="delivery-muted">
					Approved by {person(week.approval.actor_user_id)}.{" "}
					{week.approval.entries.some((e) => e.amount_minor === null)
						? "Some or all hours are unpriced; rate and currency are not assumed."
						: "Amounts and currencies are available in CSV."}
				</p>
			)}
			{own && week.state === "submitted" && (
				<p className="delivery-notice">
					Submitted for another person to review. You cannot approve your own
					week.
				</p>
			)}
			{(review ||
				(canWrite &&
					own &&
					["approved", "changes_requested"].includes(week.state))) && (
				<label className="delivery-reason">
					Reason (required for returns, adjustments and revisions)
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						maxLength={1000}
					/>
				</label>
			)}
			{edit && (
				<>
					{week.entries.length > 0 && (
						<details className="delivery-submit-week">
							<summary>Ready to submit this week?</summary>
							<p className="delivery-muted">
								Check your entries before sending them to your reviewer.
							</p>
							<label className="delivery-check">
								<input
									type="checkbox"
									checked={confirm}
									onChange={(e) => setConfirm(e.target.checked)}
								/>
								I confirm these entries are actual human time worked.
							</label>
							<button
								type="button"
								className="button button--primary"
								disabled={!confirm || !week.entries.length}
								onClick={() =>
									void action({ action: "submit", confirmed_human_time: true })
								}
							>
								Submit week for approval
							</button>
						</details>
					)}
				</>
			)}
			{review && (
				<>
					<label className="delivery-check">
						<input
							type="checkbox"
							checked={confirm}
							onChange={(e) => setConfirm(e.target.checked)}
						/>
						I have reviewed every entry and the approved minutes.
					</label>
					{week.submission?.over_cap && (
						<label className="delivery-check">
							<input
								type="checkbox"
								checked={overCap}
								onChange={(e) => setOverCap(e.target.checked)}
							/>
							Explicitly approve an agreed cap overrun, if applicable
						</label>
					)}
					{week.submission?.over_cap && (
						<p className="delivery-notice">
							This submission exceeds the cap recorded at submission. Approve
							the overrun explicitly or return it.
						</p>
					)}
					<div className="delivery-actions">
						<button
							type="button"
							className="button button--primary"
							disabled={!confirm}
							onClick={() =>
								void run(() =>
									client.mutate(
										"POST",
										`${root}/actions`,
										approvalCommand(week, minutes, reason, overCap),
									),
								)
							}
						>
							Approve week
						</button>
						<button
							type="button"
							className="button button--secondary"
							disabled={!reason.trim()}
							onClick={() => void action({ action: "request_changes", reason })}
						>
							Return with reason
						</button>
					</div>
				</>
			)}
			{canWrite &&
				own &&
				["approved", "changes_requested"].includes(week.state) && (
					<button
						type="button"
						className="button button--secondary"
						disabled={!reason.trim()}
						onClick={() => void action({ action: "revise", reason })}
					>
						Create revision
					</button>
				)}
			<div className="delivery-history">
				<button
					type="button"
					className="text-button"
					onClick={() => setShowHistory(!showHistory)}
				>
					{showHistory
						? "Hide audit trail"
						: "Show audit trail & return reasons"}
				</button>
				{showHistory &&
					(history.error ? (
						<p role="alert">{history.error}</p>
					) : !history.data ? (
						<p>Loading history...</p>
					) : (
						<ol>
							{history.data.map((event) => (
								<li key={event.id}>
									<strong>{event.action.replaceAll("_", " ")}</strong> ·{" "}
									{person(event.actor_user_id)} · {event.created_at}
									{event.reason && <p>{event.reason}</p>}
									<p>
										{hours(
											event.document.entries.reduce((n, e) => n + e.minutes, 0),
										)}{" "}
										recorded
										{event.document.approval
											? ` / ${hours(event.document.approval.entries.reduce((n, e) => n + e.approved_minutes, 0))} approved`
											: ""}{" "}
										· revision {event.document.revision}
									</p>
								</li>
							))}
						</ol>
					))}
			</div>
		</article>
	);
}
export function DeliveryWeeks({
	client,
	workspace,
	people,
	projects,
	userId,
	settings,
	refresh,
	canWrite,
	run,
	team,
}: {
	client: DeliveryClient;
	workspace: Workspace;
	people: Person[];
	projects: Project[];
	userId: string;
	settings: Settings;
	refresh: number;
	canWrite: boolean;
	run: RunDelivery;
	team: boolean;
}) {
	const initialDate = settings.settings
		? currentWeek(settings.settings.timezone, settings.settings.week_start)
		: "";
	const [date, setDate] = useState(initialDate);
	const [selected, setSelected] = useState("");
	const [downloadError, setDownloadError] = useState("");
	const root = `/v1/workspaces/${workspace.id}/time`;
	const query = `from=${date}&to=${date}${team ? "&user_id=all" : ""}`;
	const load = useCallback(
		() =>
			date
				? client.all<Week>(`${root}/weeks?${query}`, "weeks")
				: Promise.resolve([]),
		[client, root, query, date],
	);
	const { data: weeks, error } = useDeliveryResource(
		load,
		`${query}:${refresh}`,
	);
	const week = weeks?.find((w) => w.id === selected) ?? weeks?.[0];
	async function exportCsv() {
		setDownloadError("");
		try {
			const csv = await client.get<string>(`${root}/export.csv?${query}`);
			const url = URL.createObjectURL(
				new Blob([csv], { type: "text/csv;charset=utf-8" }),
			);
			const link = document.createElement("a");
			link.href = url;
			link.download = `hours-${date}.csv`;
			link.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			setDownloadError(e instanceof Error ? e.message : "Export failed.");
		}
	}
	if (!settings.settings)
		return (
			<section className="delivery-week">
				<h2>Agree the week first.</h2>
				<p>
					The Todoless owner must confirm the timezone and week start before
					time can be logged. No rate, currency or cap is assumed.
				</p>
				<p>
					Configure the agreed calendar through Todoless API/MCP, then refresh.
				</p>
			</section>
		);
	return (
		<section aria-label={team ? "Weekly approval" : "My hours"}>
			<div className="delivery-section-heading">
				<div>
					<h2>{team ? "Weekly reviews" : "My time"}</h2>
					<p className="delivery-muted">
						{team
							? "Review your team's time before approving it."
							: "Log your work, then send the week for review."}
					</p>
				</div>
				<label>
					Week starting
					<input
						type="date"
						required
						value={date}
						onChange={(e) => {
							setDate(e.target.value);
							setSelected("");
						}}
					/>
				</label>
			</div>
			<p className="delivery-muted">
				{
					[
						"Sunday",
						"Monday",
						"Tuesday",
						"Wednesday",
						"Thursday",
						"Friday",
						"Saturday",
					][settings.settings.week_start]
				}{" "}
				· {settings.settings.timezone}. Shared availability is not a billing
				cap.
			</p>
			<div className="delivery-actions">
				<button
					className="text-button"
					type="button"
					disabled={!date}
					onClick={() => void exportCsv()}
				>
					Export this week as CSV
				</button>
			</div>
			{downloadError && <p role="alert">{downloadError}</p>}
			{error ? (
				<p role="alert">{error}</p>
			) : !weeks ? (
				<p role="status">Loading weeks...</p>
			) : (
				<>
					{weeks.length > 1 && (
						<label>
							Submission
							<select
								aria-label="Submission"
								value={week?.id ?? ""}
								onChange={(e) => setSelected(e.target.value)}
							>
								{weeks.map((w) => (
									<option key={w.id} value={w.id}>
										{people.find((p) => p.user_id === w.user_id)
											?.display_name ||
											people.find((p) => p.user_id === w.user_id)?.email ||
											w.user_id}{" "}
										· {w.state.replaceAll("_", " ")}
									</option>
								))}
							</select>
						</label>
					)}
					{!week ? (
						<div className="delivery-empty">
							<p>
								{team
									? "No submissions for this week."
									: "No week started yet."}
							</p>
							{!team && canWrite && (
								<button
									type="button"
									className="button button--primary"
									disabled={!date}
									onClick={() =>
										void run(() =>
											client.mutate("POST", `${root}/weeks`, {
												week_start_date: date,
											}),
										)
									}
								>
									Start this week
								</button>
							)}
						</div>
					) : (
						<WeekDetail
							key={`${week.id}:${week.version}`}
							{...{
								week,
								client,
								workspace,
								people,
								projects,
								userId,
								canWrite,
								run,
							}}
							approver={settings.access.can_approve}
						/>
					)}
				</>
			)}
		</section>
	);
}
