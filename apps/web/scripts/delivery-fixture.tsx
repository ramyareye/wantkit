// Local test entry only. Never imported by production App.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { DeliveryPage } from "../src/react-app/DeliveryPage";
import { LocaleProvider } from "../src/react-app/LocaleProvider";
import "../src/react-app/index.css";
import "../src/react-app/App.css";

export function DemoGuide() {
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState(
		"Start as contributor to try the queue and hours. Then switch to owner to review the submitted week.",
	);
	async function connect(role: "contributor" | "owner") {
		setBusy(true);
		try {
			const response = await fetch("/__delivery_demo", { cache: "no-store" });
			if (!response.ok)
				throw new Error("The local demo is unavailable. Restart its server.");
			const fixture: {
				workspace: string;
				week: string;
				contributor: string;
				owner: string;
			} = await response.json();
			const disconnect = [
				...document.querySelectorAll<HTMLButtonElement>(
					".delivery-connection button",
				),
			].find((button) => button.textContent?.includes("Disconnect"));
			if (disconnect?.disabled)
				throw new Error(
					"Finish or retry the pending action before switching roles.",
				);
			if (disconnect) flushSync(() => disconnect.click());
			const input =
				document.querySelector<HTMLInputElement>('input[name="key"]');
			if (!input?.form)
				throw new Error("Open the Delivery connection form first.");
			input.value = fixture[role];
			input.form.requestSubmit();
			await new Promise<void>((resolve, reject) => {
				const deadline = Date.now() + 15000;
				const timer = window.setInterval(() => {
					const select = document.querySelector<HTMLSelectElement>(
						'select[aria-label="Workspace"]',
					);
					if (select?.querySelector(`option[value="${fixture.workspace}"]`)) {
						clearInterval(timer);
						select.value = fixture.workspace;
						select.dispatchEvent(new Event("change", { bubbles: true }));
						resolve();
					} else if (Date.now() > deadline) {
						clearInterval(timer);
						reject(
							new Error(
								"Connection timed out. Check the message below and retry.",
							),
						);
					}
				}, 50);
			});
			setMessage(
				`Using the ${role}. Test week: ${fixture.week}. All changes are disposable.`,
			);
		} catch (error) {
			setMessage(
				error instanceof Error ? error.message : "Could not switch demo role.",
			);
		} finally {
			setBusy(false);
		}
	}
	return (
		<aside
			aria-label="Local demo controls"
			style={{
				maxWidth: 1160,
				margin: "20px auto 0",
				padding: 20,
				border: "2px solid var(--warning-line)",
				background: "var(--warning-wash)",
				color: "var(--ink)",
			}}
		>
			<strong>LOCAL DEMO · Fictional data only</strong>
			<p>
				No Google login or real API key needed. Data resets when this server
				stops.
			</p>
			<div className="delivery-actions">
				<button
					className="button button--primary"
					disabled={busy}
					onClick={() => void connect("contributor")}
				>
					Use contributor
				</button>
				<button
					className="button button--secondary"
					disabled={busy}
					onClick={() => void connect("owner")}
				>
					Use owner
				</button>
			</div>
			<p role="status">{busy ? "Switching demo identity..." : message}</p>
			<details>
				<summary>What to try</summary>
				<ol>
					<li>
						Task queue: inspect the active task, two ready alternatives and
						Grow's blocked task. Its owner, reason, next action and dependency
						are recorded.
					</li>
					<li>
						My hours: add or edit time across Grow and Veloura, confirm it is
						human time, then submit the week.
					</li>
					<li>
						Use owner: open Weekly approval to approve or return the developer's
						submission with a reason. The owner cannot approve their own hours.
					</li>
					<li>
						Use contributor again to revise a returned week. Audit history and
						CSV preserve submitted versus approved time.
					</li>
				</ol>
			</details>
		</aside>
	);
}
createRoot(document.getElementById("root")!).render(
	<LocaleProvider initialLocale="en">
		{window.location.pathname === "/demo" && <DemoGuide />}
		<DeliveryPage email="fixture@hopkit.example" />
	</LocaleProvider>,
);
