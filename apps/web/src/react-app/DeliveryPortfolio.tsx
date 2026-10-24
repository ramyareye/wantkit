import { useCallback, useState } from "react";
import { currentWeek, type DeliveryClient } from "./delivery-client";
import { useDeliveryResource } from "./use-delivery-resource";
import type { RunDelivery } from "./DeliveryQueue";
import { availabilityCommand, type Portfolio } from "./portfolio-client";

export function PortfolioAvailability({
	days,
	save,
}: {
	days: Portfolio["availability"];
	save: (days: Portfolio["availability"]) => void;
}) {
	return (
		<form
			className="delivery-form"
			aria-label="Personal availability"
			onSubmit={(e) => {
				e.preventDefault();
				save(
					availabilityCommand(
						new FormData(e.currentTarget),
						days.map((d) => d.date),
					),
				);
			}}
		>
			<p>
				One shared budget across your projects, up to 2 hours a day. Blank means
				unset; 0 means no availability. Several zero days are fine.
			</p>
			{days.map((day) => (
				<label key={day.date}>
					{day.date} · minutes (0–120)
					<input
						type="number"
						name={day.date}
						min="0"
						max="120"
						step="1"
						defaultValue={day.minutes ?? ""}
						placeholder="Unset"
					/>
				</label>
			))}
			<button className="button">Save availability</button>
		</form>
	);
}
export function DeliveryPortfolio({
	client,
	refresh,
	run,
	canWrite,
	openQueue,
}: {
	client: DeliveryClient;
	refresh: number;
	run: RunDelivery;
	canWrite: boolean;
	openQueue: (workspace: string) => void;
}) {
	const [week, setWeek] = useState(() => currentWeek("Europe/Amsterdam", 1));
	const load = useCallback(
		() =>
			client.get<Portfolio>(
				`/v1/me/portfolio?week_start_date=${encodeURIComponent(week)}`,
			),
		[client, week],
	);
	const { data, error } = useDeliveryResource(load, `${week}:${refresh}`);
	const save = (body: Record<string, unknown>) =>
		void run(() =>
			client.mutate("PUT", "/v1/me/portfolio", {
				version: data!.version,
				...body,
			}),
		);
	function card(task: NonNullable<Portfolio["active_priority"]>) {
		return (
			<article className="delivery-task" key={task.id}>
				<small>
					{data?.projects.find((p) => p.id === task.project_id)?.name} ·{" "}
					{task.stage.toLowerCase()}
				</small>
				<h3>{task.title}</h3>
				<small>{task.id}</small>
				<p>
					<strong>Next:</strong>{" "}
					{task.details.next_action || "Set the next action in the task queue."}
				</p>
				{task.blocker && (
					<p className="delivery-notice">
						{task.blocker.reason}
						<br />
						Next: {task.blocker.next_action}
					</p>
				)}
				{!!task.readiness_issues.length && (
					<p>
						{task.readiness_issues
							.map((s) => s.replaceAll("_", " "))
							.join("; ")}
					</p>
				)}
				<button
					type="button"
					className="text-button"
					onClick={() => openQueue(task.workspace_id)}
				>
					Open workspace queue
				</button>
			</article>
		);
	}
	return (
		<section aria-label="Personal project portfolio">
			<h2>Pick up where you left off.</h2>
			<p>
				One personal portfolio across selected projects and workspaces. Tasks,
				owners and approval gates stay in their existing queues.
			</p>
			<label>
				Week starting Monday{" "}
				<input
					type="date"
					value={week}
					onChange={(e) => setWeek(e.target.value)}
				/>
			</label>
			{error ? (
				<p role="alert">{error}</p>
			) : !data ? (
				<p role="status">Loading portfolio...</p>
			) : (
				<>
					<p>
						Personal calendar: Monday · {data.timezone}. Availability is
						separate from logged hours, weekly approval and payment. Skipped
						days do not create overdue tasks.
					</p>
					<details>
						<summary>Choose portfolio projects</summary>
						<form
							className="delivery-form"
							key={`projects:${data.version}`}
							onSubmit={(e) => {
								e.preventDefault();
								save({
									project_ids: new FormData(e.currentTarget).getAll("project"),
								});
							}}
						>
							<fieldset disabled={!canWrite}>
								<p>
									Select independent projects only. Nothing is created, copied
									or moved; company work stays in Linear.
								</p>
								{data.projects.map((p) => (
									<label key={p.id}>
										<input
											type="checkbox"
											name="project"
											value={p.id}
											defaultChecked={data.project_ids.includes(p.id)}
										/>{" "}
										{p.name} · {p.workspace_name}
									</label>
								))}
								<button className="button">Save project selection</button>
							</fieldset>
						</form>
					</details>
					{!data.project_ids.length && (
						<p className="delivery-notice">
							Choose your existing projects to start. No projects are included
							automatically.
						</p>
					)}
					<h3>
						{data.paused ? "Personal work paused" : "Current active priority"}
					</h3>
					{data.resume_note && (
						<p className="delivery-notice">
							<strong>When you return:</strong> {data.resume_note}
						</p>
					)}
					{data.active_priority ? (
						card(data.active_priority)
					) : (
						<p>
							No active assignment in these projects. Start work through its
							existing task queue.
						</p>
					)}
					{data.active_conflict && (
						<p role="status">
							Other work is active in existing queues. This view highlights one
							priority; it does not silently reassign or pause the other tasks.
						</p>
					)}
					{!!data.other_active.length && (
						<form
							className="delivery-form"
							onSubmit={(e) => {
								e.preventDefault();
								save({
									focus_task_id: new FormData(e.currentTarget).get("focus"),
								});
							}}
						>
							<fieldset disabled={!canWrite}>
								<label>
									Active priority{" "}
									<select name="focus" defaultValue={data.active_priority?.id}>
										{[data.active_priority, ...data.other_active]
											.filter((t) => t !== null)
											.map((t) => (
												<option key={t.id} value={t.id}>
													{t.title}
												</option>
											))}
									</select>
								</label>
								<button className="button">Choose priority</button>
							</fieldset>
						</form>
					)}
					<form
						className="delivery-form"
						key={`pause:${data.version}`}
						onSubmit={(e) => {
							e.preventDefault();
							const f = new FormData(e.currentTarget);
							save({
								focus_task_id: data.active_priority?.id ?? null,
								paused: f.has("paused"),
								resume_note: String(f.get("note") ?? ""),
							});
						}}
					>
						<fieldset disabled={!canWrite}>
							<label>
								<input
									type="checkbox"
									name="paused"
									defaultChecked={data.paused}
								/>{" "}
								Pause personal work
							</label>
							<label>
								Where to resume{" "}
								<textarea
									name="note"
									maxLength={2000}
									defaultValue={data.resume_note}
								/>
							</label>
							<p>
								Leave a restart note when pausing. Resume by unchecking; the
								note and task evidence remain. Pausing keeps the current task's
								active slot.
							</p>
							<button className="button">Save pause / resume</button>
						</fieldset>
					</form>
					<h3>Ready fallbacks · {data.ready_alternatives.length}/2</h3>
					{data.ready_alternatives.map(card)}
					{!data.ready_alternatives.length && (
						<p>No Ready fallbacks yet. Prepare them in the existing queues.</p>
					)}
					<h3>Current blockers · {data.blocked.length}</h3>
					{data.blocked.map(card)}
					<p>
						{data.review.length} awaiting review · {data.verify.length} awaiting
						verification
					</p>
					<details>
						<summary>Optional daily availability</summary>
						<fieldset disabled={!canWrite}>
							<PortfolioAvailability
								key={`days:${week}:${data.version}`}
								days={data.availability}
								save={(availability) => save({ availability })}
							/>
							<form
								className="delivery-form"
								onSubmit={(e) => {
									e.preventDefault();
									save({
										timezone: String(
											new FormData(e.currentTarget).get("timezone") ?? "",
										),
									});
								}}
							>
								<label>
									Personal overview time zone{" "}
									<input
										name="timezone"
										required
										maxLength={100}
										defaultValue={data.timezone}
									/>
								</label>
								<button className="button">Save personal time zone</button>
							</form>
						</fieldset>
					</details>
					<h3>Updates during this week · {data.progress.length}</h3>
					{data.progress.length ? (
						<ol>
							{data.progress.map((p) => (
								<li key={p.id}>
									<strong>{p.title}</strong> · {p.date}
									<p>
										{p.reason}
										{p.stage ? ` · ${p.stage.toLowerCase()}` : ""}
									</p>
								</li>
							))}
						</ol>
					) : (
						<p>
							No task updates recorded in this week. There is no missed-day
							penalty.
						</p>
					)}
				</>
			)}
		</section>
	);
}
