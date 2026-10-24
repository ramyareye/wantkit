import { useCallback, useEffect, useRef, useState } from "react";
import { DeliveryClient, DeliveryError } from "./delivery-client";
import { DeliveryQueue, type RunDelivery } from "./DeliveryQueue";
import { DeliveryWeeks } from "./DeliveryWeeks";
import { DeliveryPortfolio } from "./DeliveryPortfolio";
import type { Person, Project, Settings, Workspace } from "./delivery-types";
import { ThemeSwitch } from "./ThemeSwitch";
import { useDeliveryResource } from "./use-delivery-resource";
import "./DeliveryPage.css";

type Connection = {
	client: DeliveryClient;
	user: { id: string; email: string };
	scopes: string[];
	workspaces: Workspace[];
};
function WorkspaceDelivery({
	connection,
	workspace,
	onLock,
	onWorkspace,
}: {
	connection: Connection;
	workspace: Workspace;
	onLock: (locked: boolean) => void;
	onWorkspace: (id: string) => void;
}) {
	const { client, user, scopes } = connection;
	const [tab, setTab] = useState("queue");
	const [refresh, setRefresh] = useState(0);
	const [busy, setBusy] = useState(false);
	const locked = useRef(false);
	const [error, setError] = useState("");
	const [stale, setStale] = useState(false);
	const [notice, setNotice] = useState("");
	const load = useCallback(async () => {
		const [projects, people, settings] = await Promise.all([
			client.get<{ projects: Project[] }>(
				`/v1/workspaces/${workspace.id}/projects`,
			),
			client.all<Person>(`/v1/workspaces/${workspace.id}/members`, "members"),
			workspace.role === "VIEWER"
				? Promise.resolve<Settings>({
						settings: null,
						access: {
							user_id: user.id,
							can_approve: false,
							can_configure: false,
						},
					})
				: client.get<Settings>(`/v1/workspaces/${workspace.id}/time/settings`),
		]);
		return { projects: projects.projects, people, settings };
	}, [client, workspace.id, workspace.role, user.id]);
	const result = useDeliveryResource(load, String(refresh), true);
	const run: RunDelivery = async (action) => {
		if (locked.current) return;
		locked.current = true;
		onLock(true);
		setBusy(true);
		setError("");
		setNotice("");
		try {
			await action();
			setRefresh((n) => n + 1);
			setNotice("Saved in Todoless.");
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "The action could not be completed.",
			);
			if (e instanceof DeliveryError && [401, 403, 404, 409].includes(e.status))
				setStale(true);
		} finally {
			locked.current = false;
			onLock(client.needsRetry);
			setBusy(false);
		}
	};
	const canWrite =
		workspace.role !== "VIEWER" &&
		(scopes.includes("*") || scopes.includes("workspace:write"));
	return (
		<>
			<div className="delivery-actions">
				<nav className="delivery-tabs" aria-label="Delivery views">
					<button
						aria-current={tab === "queue" ? "page" : undefined}
						disabled={busy || client.needsRetry}
						onClick={() => setTab("queue")}
					>
						Task queue
					</button>
					<button
						aria-current={tab === "hours" ? "page" : undefined}
						disabled={busy || client.needsRetry}
						onClick={() => setTab("hours")}
					>
						My hours
					</button>
					<button
						aria-current={tab === "portfolio" ? "page" : undefined}
						disabled={busy || client.needsRetry}
						onClick={() => setTab("portfolio")}
					>
						Personal portfolio
					</button>
					{result.data?.settings.access.can_approve && (
						<button
							aria-current={tab === "approval" ? "page" : undefined}
							disabled={busy || client.needsRetry}
							onClick={() => setTab("approval")}
						>
							Weekly approval
						</button>
					)}
				</nav>
				<button
					type="button"
					className="text-button"
					disabled={busy || client.needsRetry}
					onClick={() => {
						setStale(false);
						setError("");
						setNotice("");
						setRefresh((n) => n + 1);
					}}
				>
					Refresh current records
				</button>
			</div>
			{error && (
				<p className="delivery-notice" role="alert">
					{error}
					{stale
						? " Refresh current records before making another change."
						: ""}
				</p>
			)}
			{client.needsRetry && !busy && (
				<div className="delivery-notice">
					<p>
						The last action has an uncertain outcome. Retry it with the same
						request before changing anything else. Keep this tab open.
					</p>
					<button
						className="button button--primary"
						type="button"
						onClick={() => void run(() => client.retry())}
					>
						Retry exact action
					</button>
				</div>
			)}
			<p role="status" className="delivery-muted">
				{busy ? "Saving..." : notice}
			</p>
			{result.error ? (
				<p role="alert">{result.error}</p>
			) : !result.data ? (
				<p role="status">Loading workspace...</p>
			) : (
				<fieldset
					className="delivery-content"
					disabled={busy || stale || client.needsRetry || result.loading}
				>
					{!canWrite && tab !== "portfolio" && (
						<p className="delivery-notice">
							This connection has read-only access.
						</p>
					)}
					{tab === "portfolio" ? (
						<DeliveryPortfolio
							{...{ client, refresh, run }}
							canWrite={
								scopes.includes("*") || scopes.includes("workspace:write")
							}
							openQueue={(id) => {
								onWorkspace(id);
								setTab("queue");
							}}
						/>
					) : tab === "queue" ? (
						<DeliveryQueue
							{...result.data}
							{...{ client, workspace, refresh, canWrite, run }}
							userId={user.id}
						/>
					) : (
						<DeliveryWeeks
							key={tab}
							{...result.data}
							{...{ client, workspace, refresh, canWrite, run }}
							userId={user.id}
							team={
								tab === "approval" && result.data.settings.access.can_approve
							}
						/>
					)}
				</fieldset>
			)}
		</>
	);
}
export function DeliveryPage({ email }: { email: string }) {
	const [connection, setConnection] = useState<Connection | null>(null);
	const clientRef = useRef<DeliveryClient | null>(null);
	const [workspaceId, setWorkspaceId] = useState("");
	const [busy, setBusy] = useState(false);
	const connecting = useRef(false);
	const [error, setError] = useState("");
	useEffect(() => {
		const clear = () => {
			clientRef.current?.disconnect();
			setConnection(null);
		};
		const guard = (event: BeforeUnloadEvent) => {
			if (clientRef.current?.needsRetry) {
				event.preventDefault();
				event.returnValue = "";
			}
		};
		window.addEventListener("pagehide", clear);
		window.addEventListener("beforeunload", guard);
		return () => {
			clientRef.current?.disconnect();
			window.removeEventListener("pagehide", clear);
			window.removeEventListener("beforeunload", guard);
		};
	}, []);
	const workspace = connection?.workspaces.find((w) => w.id === workspaceId);
	function disconnect() {
		clientRef.current?.disconnect();
		clientRef.current = null;
		setConnection(null);
		setWorkspaceId("");
		setError("");
	}
	return (
		<main className="delivery-page" lang="en" dir="ltr">
			<header className="delivery-header">
				<a className="delivery-brand" href="/">
					HopKit<span>by HipHop</span>
				</a>
				<div className="delivery-actions">
					<a className="text-button" href="/">
						Planning home
					</a>
					<ThemeSwitch />
				</div>
			</header>
			<div
				className={
					connection
						? "delivery-intro delivery-intro--connected"
						: "delivery-intro"
				}
			>
				<p className="eyebrow">Team delivery / Pilot</p>
				<h1>
					{connection ? (
						"Delivery."
					) : (
						<>
							Make room
							<br />
							for the work.
						</>
					)}
				</h1>
				<p>A focused queue. Honest hours. A clear weekly review.</p>
			</div>
			{!connection ? (
				<section className="delivery-connect">
					<div>
						<h2>Connect your work.</h2>
						<p>
							Use your personal Todoless key. It stays in memory for this tab
							and is cleared when you disconnect or leave. HopKit does not save
							it.
						</p>
						<p className="delivery-muted">
							Signed in to HopKit as {email}. Your Todoless identity and
							permissions come from the key you enter.
						</p>
					</div>
					<form
						className="delivery-form"
						onSubmit={(event) => {
							event.preventDefault();
							if (connecting.current) return;
							connecting.current = true;
							setBusy(true);
							setError("");
							const input = event.currentTarget.elements.namedItem(
								"key",
							) as HTMLInputElement;
							const client = new DeliveryClient(input.value.trim());
							input.value = "";
							clientRef.current = client;
							void (async () => {
								try {
									const me = await client.get<{
										user: Connection["user"];
										scopes: string[];
										workspace_id?: string | null;
									}>("/v1/me");
									if (me.workspace_id !== null)
										throw new Error(
											"Use a personal key and the current Todoless API. Workspace keys cannot record human time.",
										);
									const workspaces = await client.all<Workspace>(
										"/v1/workspaces",
										"workspaces",
									);
									setConnection({
										client,
										user: me.user,
										scopes: me.scopes,
										workspaces,
									});
									setWorkspaceId(workspaces[0]?.id ?? "");
								} catch (e) {
									client.disconnect();
									setError(
										e instanceof Error ? e.message : "Connection failed.",
									);
								} finally {
									connecting.current = false;
									setBusy(false);
								}
							})();
						}}
					>
						<label>
							Personal Todoless key
							<input
								name="key"
								type="password"
								autoComplete="off"
								spellCheck={false}
								required
								minLength={16}
								maxLength={512}
							/>
						</label>
						<p className="delivery-muted">
							Needs workspace:read and members:read. Add workspace:write to log
							time and update tasks.
						</p>
						<button className="button button--primary" disabled={busy}>
							{busy ? "Connecting..." : "Connect Todoless"}
						</button>
						{error && <p role="alert">{error}</p>}
					</form>
				</section>
			) : (
				<>
					<section className="delivery-connection">
						<div>
							<span className="delivery-muted">Connected as</span>
							<strong>{connection.user.email}</strong>
						</div>
						<label>
							Workspace
							<select
								aria-label="Workspace"
								value={workspaceId}
								onChange={(e) => setWorkspaceId(e.target.value)}
								disabled={busy || connection.client.needsRetry}
							>
								<option value="" disabled>
									Choose a workspace
								</option>
								{connection.workspaces.map((w) => (
									<option key={w.id} value={w.id}>
										{w.name}
									</option>
								))}
							</select>
						</label>
						<button
							type="button"
							className="text-button"
							disabled={busy}
							onClick={disconnect}
						>
							Disconnect &amp; clear key
						</button>
					</section>
					{workspace ? (
						<WorkspaceDelivery
							key={workspace.id}
							{...{ connection, workspace }}
							onLock={setBusy}
							onWorkspace={setWorkspaceId}
						/>
					) : (
						<p>No Todoless workspaces are available for this key.</p>
					)}
				</>
			)}
			<footer className="delivery-footer">
				Todoless keeps the task and time records. Payments remain manual.
			</footer>
		</main>
	);
}
