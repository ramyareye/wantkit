// Synthetic integration only: actual UI + bounded proxy + actual Todoless Worker/D1.
// Does not load Wrangler configs, .dev.vars, operator credentials or remote bindings.
// HopKit session enforcement is separately tested with its real Worker/auth middleware.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readdir, readFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import {
	DeliveryClient,
	DeliveryError,
	currentWeek,
} from "../src/react-app/delivery-client";
import { forwardDelivery } from "../src/worker/delivery-proxy";
import {
	progressCommand,
	taskUpdates,
} from "../src/react-app/delivery-task-updates";
import type {
	DeliveryCard,
	TaskHistoryEntry,
} from "../src/react-app/delivery-types";
const interactive = Bun.argv.includes("--serve");
const verifyUpdates = Bun.argv.includes("--verify-updates");
const demoWeek = currentWeek("Europe/Amsterdam", 1);
const webRoot = fileURLToPath(new URL("../", import.meta.url));
const apiRoot =
	process.env.TODOLESS_SOURCE_ROOT ??
	fileURLToPath(new URL("../../../../todoless/apps/api/", import.meta.url));
const require = createRequire(`${apiRoot}/node_modules/wrangler/package.json`);
const { build } = require("esbuild");
const { Miniflare } = require("miniflare");
const chromium =
	interactive || verifyUpdates
		? undefined
		: (await import(process.env.PLAYWRIGHT_MODULE ?? "playwright")).chromium;
const bundle = await build({
	absWorkingDir: apiRoot,
	entryPoints: ["src/index.ts"],
	bundle: true,
	write: false,
	format: "esm",
	platform: "browser",
	target: "es2022",
});
const ui = await build({
	absWorkingDir: webRoot,
	entryPoints: ["scripts/delivery-fixture.tsx"],
	bundle: true,
	write: false,
	outfile: "delivery.js",
	format: "esm",
	platform: "browser",
	jsx: "automatic",
	define: { "process.env.NODE_ENV": '"development"' },
});
const runtime = new Miniflare({
	modules: true,
	script: bundle.outputFiles[0].text,
	compatibilityDate: "2026-02-05",
	d1Databases: ["DB"],
	d1Persist: false,
	host: "127.0.0.1",
	port: 0,
	bindings: {
		ENVIRONMENT: "dev",
		API_KEY_PEPPER: "synthetic-hopkit-test-pepper",
		APP_BASE_URL: "http://127.0.0.1",
	},
	outboundService: () =>
		new Response("External requests disabled", { status: 503 }),
});
let server: ReturnType<typeof Bun.serve> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
	const db = await runtime.getD1Database("DB");
	for (const file of (await readdir(`${apiRoot}/migrations`))
		.filter((name) => name.endsWith(".sql"))
		.sort()) {
		const sql = await readFile(`${apiRoot}/migrations/${file}`, "utf8");
		await db.batch(
			sql
				.split(";")
				.map((s) => s.trim())
				.filter(Boolean)
				.map((s) => db.prepare(s)),
		);
	}
	const backend = String(await runtime.ready).replace(/\/$/, "");
	async function api(
		method: string,
		path: string,
		body?: unknown,
		key?: string,
	) {
		const response = await fetch(`${backend}${path}`, {
			method,
			headers: {
				"content-type": "application/json",
				"idempotency-key": crypto.randomUUID(),
				...(key ? { authorization: `Bearer ${key}` } : {}),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		});
		const result = await response.json();
		assert.equal(result.success, true, JSON.stringify(result));
		return result.data;
	}
	async function person(email: string, workspace_name: string) {
		const registered = await api("POST", "/v1/auth/register", {
			email,
			workspace_name,
		});
		const claimed = await api("POST", "/v1/auth/verify-email", {
			verification_token: registered.verification_token,
		});
		return {
			key: claimed.api_key,
			id: claimed.user.id,
			workspace: registered.workspace.id,
		};
	}
	const owner = await person("owner@example.test", "HipHop fixture");
	const member = await person("developer@example.test", "Personal fixture");
	await api(
		"POST",
		`/v1/workspaces/${owner.workspace}/members`,
		{ email: "developer@example.test", role: "MEMBER" },
		owner.key,
	);
	const timeRoot = `/v1/workspaces/${owner.workspace}/time`;
	await api(
		"PUT",
		`${timeRoot}/settings`,
		{
			version: 0,
			timezone: "Europe/Amsterdam",
			week_start: 1,
			confirmed: true,
		},
		owner.key,
	);
	const pairs = [];
	for (const name of ["Grow", "Veloura", "WF"]) {
		const project = await api(
			"POST",
			`/v1/workspaces/${owner.workspace}/projects`,
			{ name },
			owner.key,
		);
		const task = await api(
			"POST",
			`/v1/workspaces/${owner.workspace}/tasks`,
			{
				title: `${name} device acceptance`,
				priority: name === "Grow" ? "P0" : name === "Veloura" ? "P1" : "P2",
				project_id: project.id,
				assignee_user_id: interactive && name === "WF" ? owner.id : member.id,
			},
			owner.key,
		);
		await api(
			"PUT",
			`/v1/tasks/${task.id}/delivery`,
			{
				version: 1,
				reason: "Synthetic pilot setup",
				stage: "READY",
				reviewer_user_id: owner.id,
				details: {
					area: "App",
					repository: "https://example.test/repository",
					outcome: "Complete the selected flow",
					scope: "One bounded change",
					base_ref: "fixture-base",
					environment: "local",
					next_action: "Run the device acceptance check",
					contract_refs: ["docs/contract.md"],
					acceptance_checks: ["Flow completes"],
					setup_ready: true,
					integration_mode: "fixture",
					exclusions: ["Live services"],
				},
			},
			owner.key,
		);
		pairs.push({ project, task });
	}
	if (interactive) {
		const sample = await api(
			"GET",
			`/v1/tasks/${pairs[0].task.id}/delivery`,
			undefined,
			owner.key,
		);
		async function demoTask(
			title: string,
			projectId: string,
			assignee = member.id,
		) {
			const task = await api(
				"POST",
				`/v1/workspaces/${owner.workspace}/tasks`,
				{
					title,
					project_id: projectId,
					assignee_user_id: assignee,
					priority: "P1",
				},
				owner.key,
			);
			return api(
				"PUT",
				`/v1/tasks/${task.id}/delivery`,
				{
					version: task.version,
					reason: "Local demo fixture",
					stage: "READY",
					reviewer_user_id: owner.id,
					details: {
						...sample.details,
						outcome: title,
						next_action: "Try the local pilot flow",
					},
				},
				owner.key,
			);
		}
		async function move(
			task: { id: string; version: number },
			stage: string,
			extra: Record<string, unknown> = {},
		) {
			return api(
				"PUT",
				`/v1/tasks/${task.id}/delivery`,
				{
					version: task.version,
					reason: "Local demo fixture",
					stage,
					...extra,
				},
				owner.key,
			);
		}
		let review = await demoTask(
			"Veloura: review onboarding layout",
			pairs[1].project.id,
		);
		review = await move(review, "ACTIVE");
		await move(review, "REVIEW", {
			details: {
				source_complete: true,
				evidence: ["docs/demo-onboarding-check.md"],
				build_ref: "demo-build",
			},
		});
		const prerequisite = await demoTask(
			"Grow: confirm progress API contract",
			pairs[0].project.id,
			owner.id,
		);
		const blocked = await demoTask(
			"Grow: sync offline progress",
			pairs[0].project.id,
		);
		await move(blocked, "BLOCKED", {
			depends_on: [prerequisite.id],
			blocker: {
				owner_user_id: owner.id,
				reason: "Waiting for the progress API contract",
				next_action:
					"Owner confirms the response fields; then resume app integration",
			},
		});
		const active = await demoTask(
			"Grow: connect the lesson progress screen",
			pairs[0].project.id,
		);
		await move(active, "ACTIVE");
		let week = await api(
			"POST",
			`${timeRoot}/weeks`,
			{ week_start_date: demoWeek },
			member.key,
		);
		for (const [index, pair] of pairs.slice(0, 2).entries()) {
			week = await api(
				"POST",
				`${timeRoot}/weeks/${week.id}/actions`,
				{
					action: "save_entry",
					version: week.version,
					entry: {
						project_id: pair.project.id,
						task_id: pair.task.id,
						work_date: demoWeek,
						activity: "qa",
						minutes: index ? 120 : 90,
						note: `${pair.project.name} fictional device QA`,
					},
				},
				member.key,
			);
		}
		const queue = await api(
			"GET",
			`/v1/workspaces/${owner.workspace}/delivery/queue`,
			undefined,
			member.key,
		);
		assert.equal(queue.active.length, 1);
		assert.equal(queue.ready_alternatives.length, 2);
		assert.equal(queue.blocked.length, 1);
		assert.equal(queue.review.length, 1);
		assert.equal(queue.blocked[0].depends_on[0].satisfied, false);
	}
	server = Bun.serve({
		hostname: "127.0.0.1",
		port: 0,
		async fetch(request) {
			const url = new URL(request.url);
			if (url.hostname !== "127.0.0.1")
				return new Response("Loopback only", { status: 403 });
			if (url.pathname === "/__delivery_demo") {
				if (!interactive || request.method !== "GET")
					return new Response("Not found", { status: 404 });
				if (request.headers.get("sec-fetch-site") !== "same-origin")
					return new Response("Same-origin demo only", { status: 403 });
				return Response.json(
					{
						workspace: owner.workspace,
						week: demoWeek,
						contributor: member.key,
						owner: owner.key,
					},
					{ headers: { "cache-control": "no-store" } },
				);
			}
			if (url.pathname === "/api/delivery/request")
				return forwardDelivery(request, {
					BETTER_AUTH_URL: url.origin,
					TODOLESS_API_ORIGIN: backend,
				});
			const file = ui.outputFiles.find((f) => f.path.endsWith(url.pathname));
			if (url.pathname === "/delivery.js" || url.pathname === "/delivery.css")
				return new Response(file!.text, {
					headers: {
						"content-type": url.pathname.endsWith(".css")
							? "text/css"
							: "text/javascript",
					},
				});
			return new Response(
				'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>HopKit delivery fixture</title><link rel="stylesheet" href="/delivery.css"></head><body><div id="root"></div><script type="module" src="/delivery.js"></script></body></html>',
				{ headers: { "content-type": "text/html" } },
			);
		},
	});
	if (verifyUpdates) {
		// Real client/proxy/API/D1 checks without browser automation or real identities.
		let loseResponse = false;
		const commands: string[] = [];
		const clientFor = (key: string) =>
			new DeliveryClient(key, async (_url, init) => {
				const response = await fetch(
					`${server!.url.origin}/api/delivery/request`,
					{
						...init,
						headers: {
							...Object.fromEntries(new Headers(init!.headers)),
							origin: server!.url.origin,
						},
					},
				);
				if (JSON.parse(String(init!.body)).method === "PUT") {
					commands.push(String(init!.body));
					if (loseResponse) {
						loseResponse = false;
						assert.equal(response.status, 200);
						throw new Error("Synthetic lost progress response");
					}
				}
				return response;
			});
		const contributor = clientFor(member.key),
			reviewer = clientFor(owner.key);
		const path = `/v1/tasks/${pairs[0].task.id}/delivery`;
		const historyPath = `/v1/tasks/${pairs[0].task.id}/history`;
		let card = await contributor.get<DeliveryCard>(path);
		card = await contributor.mutate("PUT", path, {
			version: card.version,
			stage: "ACTIVE",
			reason: "Start local acceptance preparation",
		});
		const data = new FormData();
		for (const [name, value] of Object.entries({
			progress: "Mapped account-switch state",
			next: "Reproduce unresolved pending claim locally",
			evidence: "docs/switch.md",
			build: "build59",
		}))
			data.set(name, value);
		const before = card.version;
		loseResponse = true;
		await assert.rejects(
			contributor.mutate("PUT", path, progressCommand(card, data)),
			/lost progress response/,
		);
		assert.equal(contributor.needsRetry, true);
		await assert.rejects(contributor.mutate("PUT", path, {}), /Retry/);
		card = await contributor.retry<DeliveryCard>();
		assert.equal(commands.at(-1), commands.at(-2));
		assert.equal(card.version, before + 1);
		assert.equal(card.stage, "ACTIVE");
		assert.equal(
			card.details.next_action,
			"Reproduce unresolved pending claim locally",
		);
		assert.equal(card.details.source_complete, false);
		const histories = () =>
			contributor.all<TaskHistoryEntry>(historyPath, "history");
		assert.equal(
			taskUpdates(await histories()).filter(
				(e) => e.reason === "Mapped account-switch state",
			).length,
			1,
		);
		const stale = card;
		const writes = await Promise.allSettled([
			contributor.mutate<DeliveryCard>(
				"PUT",
				path,
				progressCommand(stale, data),
			),
			clientFor(member.key).mutate<DeliveryCard>(
				"PUT",
				path,
				progressCommand(stale, data),
			),
		]);
		assert.equal(writes.filter((r) => r.status === "fulfilled").length, 1);
		const rejected = writes.find((r) => r.status === "rejected");
		assert.ok(
			rejected?.status === "rejected" &&
				rejected.reason instanceof DeliveryError &&
				rejected.reason.status === 409,
		);
		card = await contributor.get<DeliveryCard>(path);
		assert.equal(card.version, stale.version + 1);
		card = await contributor.mutate("PUT", path, {
			version: card.version,
			stage: "BLOCKED",
			reason: "Need the build",
			blocker: {
				owner_user_id: owner.id,
				reason: "Build unassigned",
				next_action: "Assign build",
			},
		});
		for (const [name, value] of Object.entries({
			owner: member.id,
			blocker_reason: "Need local switch reproduction",
			blocker_next: "Developer isolates pending payload",
		}))
			data.set(name, value);
		card = await contributor.mutate("PUT", path, progressCommand(card, data));
		assert.equal(card.stage, "BLOCKED");
		assert.equal(card.blocker?.owner_user_id, member.id);
		assert.equal(card.blocker?.reason, "Need local switch reproduction");
		assert.equal(
			card.blocker?.next_action,
			"Developer isolates pending payload",
		);
		for (const stage of ["READY", "ACTIVE", "REVIEW"] as const)
			card = await contributor.mutate("PUT", path, {
				version: card.version,
				stage,
				reason: "Local task flow",
				...(stage === "REVIEW"
					? { details: { source_complete: true, evidence: ["docs/switch.md"] } }
					: {}),
			});
		await assert.rejects(
			contributor.mutate("PUT", path, {
				version: card.version,
				reason: "Unauthorized review evidence",
				details: { evidence: ["bad"] },
			}),
			(e) => e instanceof DeliveryError && e.status === 403,
		);
		await assert.rejects(
			reviewer.mutate("PUT", path, {
				version: card.version,
				reason: "Scope still frozen",
				details: { next_action: "Skip rework" },
			}),
			(e) => e instanceof DeliveryError && e.status === 409,
		);
		card = await reviewer.mutate("PUT", path, {
			version: card.version,
			stage: "ACTIVE",
			reason: "Add unresolved-account-switch evidence before approval",
		});
		data.set("progress", "Working on reviewer feedback");
		card = await contributor.mutate("PUT", path, progressCommand(card, data));
		const history = await histories();
		const returned = taskUpdates(history).find((e) => e.returned);
		assert.equal(
			returned?.reason,
			"Add unresolved-account-switch evidence before approval",
		);
		assert.equal(returned?.actor?.user_id, owner.id);
		assert.equal(
			taskUpdates(history)[0].reason,
			"Working on reviewer feedback",
		);
		// A real outsider cannot read feedback. A viewer may read, never write progress.
		const observer = await person("observer@example.test", "Observer fixture");
		const observerClient = clientFor(observer.key);
		await assert.rejects(
			observerClient.get(historyPath),
			(e) => e instanceof DeliveryError && e.status === 404,
		);
		await api(
			"POST",
			`/v1/workspaces/${owner.workspace}/members`,
			{ email: "observer@example.test", role: "VIEWER" },
			owner.key,
		);
		await observerClient.get(historyPath);
		await assert.rejects(
			observerClient.mutate("PUT", path, progressCommand(card, data)),
			(e) => e instanceof DeliveryError && e.status === 403,
		);
		await api(
			"DELETE",
			`/v1/workspaces/${owner.workspace}/members/${observer.id}`,
			undefined,
			owner.key,
		);
		await assert.rejects(
			observerClient.get(historyPath),
			(e) => e instanceof DeliveryError && e.status === 404,
		);
		console.log(
			"PASS: progress/blocker updates, exact retry, concurrent conflict, review freeze, persistent return reason and outsider/viewer/revoked-member authorization on real disposable D1.",
		);
	} else if (interactive) {
		console.log(`HopKit demo ready: ${server.url.href}demo`);
		console.log(
			`Synthetic data only. Week ${demoWeek}, Monday / Europe/Amsterdam. Stop with Ctrl+C; data resets on restart.`,
		);
		await new Promise<void>((resolve) => {
			process.once("SIGINT", resolve);
			process.once("SIGTERM", resolve);
		});
	} else {
		browser = await chromium!.launch({ channel: "chrome", headless: true });
		const context = await browser.newContext({
			viewport: { width: 1280, height: 1000 },
			acceptDownloads: true,
		});
		await context.route(
			"**/*",
			(route: {
				request(): { url(): string };
				continue(): Promise<void>;
				abort(): Promise<void>;
			}) =>
				new URL(route.request().url()).hostname === "127.0.0.1"
					? route.continue()
					: route.abort(),
		);
		const page = await context.newPage();
		const errors: string[] = [];
		let loseFirstSave = true;
		let lostCommand: string | null = null;
		let replayedCommand: string | null = null;
		let pendingTaskLoad:
			| {
					started: () => void;
					released: Promise<void>;
			  }
			| undefined;
		function holdNextTaskLoad() {
			const started = Promise.withResolvers<void>();
			const released = Promise.withResolvers<void>();
			pendingTaskLoad = {
				started: started.resolve,
				released: released.promise,
			};
			return { started: started.promise, release: released.resolve };
		}
		await page.route(
			"**/api/delivery/request",
			async (route: {
				request(): { postData(): string };
				fetch(): Promise<unknown>;
				abort(): Promise<void>;
				continue(): Promise<void>;
			}) => {
				const body = route.request().postData();
				const command = JSON.parse(body);
				if (pendingTaskLoad && command.path.includes("/tasks?project_id=")) {
					const pending = pendingTaskLoad;
					pendingTaskLoad = undefined;
					pending.started();
					await pending.released;
				}
				if (command.body?.action === "save_entry") {
					if (loseFirstSave) {
						loseFirstSave = false;
						lostCommand = body;
						await route.fetch();
						await route.abort();
						return;
					}
					if (replayedCommand === null) replayedCommand = body;
				}
				await route.continue();
			},
		);
		page.on("pageerror", (error: Error) => errors.push(error.message));
		await page.goto(server.url.href);
		async function connect(key: string) {
			if (
				await page
					.getByRole("button", { name: "Disconnect & clear key" })
					.count()
			)
				await page
					.getByRole("button", { name: "Disconnect & clear key" })
					.click();
			await page.getByLabel("Personal Todoless key").fill(key);
			await page
				.getByRole("button", { name: "Connect Todoless", exact: true })
				.click();
			try {
				await page
					.getByLabel("Workspace", { exact: true })
					.selectOption(owner.workspace, { timeout: 5000 });
			} catch (error) {
				console.error("Connect UI:", await page.locator("main").innerText());
				throw error;
			}
			await page
				.getByRole("heading", { name: "One thing in motion." })
				.waitFor();
		}
		async function viewHours(team = false) {
			await page
				.getByRole("button", {
					name: team ? "Weekly approval" : "My hours",
					exact: true,
				})
				.click();
			await page.getByLabel("Week starting").fill("2026-10-19");
		}
		const output = fileURLToPath(
			new URL("../../../.tmp/delivery-ui/", import.meta.url),
		);
		await mkdir(output, { recursive: true });
		await connect(member.key);
		await page.getByText("Two alternatives are ready.").waitFor();
		await page.screenshot({
			path: `${output}/queue-desktop.png`,
			fullPage: true,
		});
		const grow = page.locator("article.delivery-task").filter({
			has: page.getByRole("heading", {
				name: "Grow device acceptance",
				exact: true,
			}),
		});
		await grow.getByRole("button", { name: "Update status" }).click();
		await grow.getByLabel("Move to").selectOption("ACTIVE");
		await grow
			.getByLabel("Reason", { exact: true })
			.fill("Starting the fixture task");

		await api(
			"PUT",
			`/v1/tasks/${pairs[0].task.id}/delivery`,
			{
				version: 2,
				reason: "Concurrent next-action correction",
				details: { next_action: "Run the corrected fixture check" },
			},
			owner.key,
		);
		await grow.getByRole("button", { name: "Save status" }).click();
		await page
			.getByRole("alert")
			.filter({
				hasText: "Refresh current records before making another change.",
			})
			.waitFor();
		assert.equal(
			await grow.getByRole("button", { name: "Save status" }).isDisabled(),
			true,
		);
		await page.getByRole("button", { name: "Refresh current records" }).click();
		await grow.getByRole("button", { name: "Update status" }).click();
		await grow.getByLabel("Move to").selectOption("ACTIVE");
		await grow
			.getByLabel("Reason", { exact: true })
			.fill("Starting after reloading the correction");
		await grow.getByRole("button", { name: "Save status" }).click();
		await page.getByText("Saved in Todoless.").waitFor();
		assert.equal(
			(
				await api(
					"GET",
					`/v1/workspaces/${owner.workspace}/delivery/queue`,
					undefined,
					member.key,
				)
			).active.length,
			1,
		);
		await grow.getByRole("button", { name: "Update status" }).click();
		await grow.getByLabel("Move to").selectOption("REVIEW");
		await grow
			.getByLabel("Reason", { exact: true })
			.fill("Source ready for review");
		await grow
			.getByLabel("Evidence references (one per line)")
			.fill("docs/device-qa.md");
		await grow.getByLabel("Source is complete and ready for review").check();
		await grow.getByRole("button", { name: "Save status" }).click();
		await page
			.getByText("Source ready for review", { exact: true })
			.waitFor({ state: "hidden" });
		await viewHours();
		await page.getByRole("button", { name: "Start this week" }).click();
		for (const [index, pair] of pairs.slice(0, 2).entries()) {
			await page.getByRole("button", { name: "Log time", exact: true }).click();
			await page
				.getByLabel("Project", { exact: true })
				.selectOption(pair.project.id);

			await page
				.locator(`select[name="task"] option[value="${pair.task.id}"]`)
				.waitFor({ state: "attached" });
			assert.equal(
				await page.getByLabel("Task", { exact: true }).inputValue(),
				"",
			);
			await page.getByLabel("Task", { exact: true }).selectOption(pair.task.id);
			await page
				.getByLabel("Minutes", { exact: true })
				.fill(index ? "120" : "90");
			await page
				.getByLabel("What did you work on?")
				.fill(index ? "Veloura device QA" : "Grow device QA");
			await page
				.getByRole("button", { name: "Save time", exact: true })
				.click();
			if (index === 0) {
				await page.getByRole("button", { name: "Retry exact action" }).click();
				assert.equal(replayedCommand, lostCommand);
			}
			await page
				.getByText(index ? "Veloura device QA" : "Grow device QA", {
					exact: false,
				})
				.first()
				.waitFor();
		}
		// Hold options until the edit form has mounted: defaultValue cannot recover here.
		const beforeEdit = (
			await api(
				"GET",
				`${timeRoot}/weeks?from=2026-10-19&to=2026-10-19`,
				undefined,
				member.key,
			)
		).weeks[0];
		const taskInput = page.getByLabel("Task", { exact: true });
		const projectInput = page.getByLabel("Project", { exact: true });
		const editVeloura = page
			.getByRole("row")
			.filter({ hasText: "Veloura device QA" })
			.getByRole("button", { name: "Edit", exact: true });
		const delayed = holdNextTaskLoad();
		await editVeloura.click();
		await delayed.started;
		try {
			assert.equal(await taskInput.isDisabled(), true);
			assert.equal(
				await page
					.getByRole("button", { name: "Save time", exact: true })
					.isDisabled(),
				true,
			);
			assert.equal(await projectInput.inputValue(), pairs[1].project.id);
		} finally {
			delayed.release();
		}
		await page
			.locator(`select[name="task"] option[value="${pairs[1].task.id}"]`)
			.waitFor({ state: "attached" });
		assert.equal(
			await taskInput.inputValue(),
			pairs[1].task.id,
			"Edit must preselect the saved task after delayed options load",
		);
		assert.equal(await page.getByLabel("Work date").inputValue(), "2026-10-19");
		assert.equal(
			await page.getByLabel("Minutes", { exact: true }).inputValue(),
			"120",
		);
		await page.getByRole("button", { name: "Save time", exact: true }).click();
		await page
			.getByRole("heading", { name: "Edit time entry" })
			.waitFor({ state: "hidden" });
		const afterEdit = (
			await api(
				"GET",
				`${timeRoot}/weeks?from=2026-10-19&to=2026-10-19`,
				undefined,
				member.key,
			)
		).weeks[0];
		assert.equal(afterEdit.version, beforeEdit.version + 1);
		assert.deepEqual(
			afterEdit.entries,
			beforeEdit.entries,
			"Saving without reselecting preserves entry/task IDs and all logged fields",
		);

		// Changing projects must clear the old selection, including on a switch back.
		await editVeloura.click();
		await page
			.locator(`select[name="task"] option[value="${pairs[1].task.id}"]`)
			.waitFor({ state: "attached" });
		const changed = holdNextTaskLoad();
		await projectInput.selectOption(pairs[0].project.id);
		await changed.started;
		try {
			assert.equal(await taskInput.isDisabled(), true);
			assert.equal(await taskInput.inputValue(), "");
		} finally {
			changed.release();
		}
		await page
			.locator(`select[name="task"] option[value="${pairs[0].task.id}"]`)
			.waitFor({ state: "attached" });
		assert.equal(await taskInput.inputValue(), "");
		assert.equal(
			await page
				.locator(`select[name="task"] option[value="${pairs[1].task.id}"]`)
				.count(),
			0,
		);
		await taskInput.selectOption(pairs[0].task.id);
		assert.equal(await taskInput.inputValue(), pairs[0].task.id);
		await projectInput.selectOption(pairs[1].project.id);
		await page
			.locator(`select[name="task"] option[value="${pairs[1].task.id}"]`)
			.waitFor({ state: "attached" });
		assert.equal(await taskInput.inputValue(), "");
		await page.getByRole("button", { name: "Save time", exact: true }).click();
		assert.equal(
			await page.getByRole("heading", { name: "Edit time entry" }).isVisible(),
			true,
		);
		assert.equal(
			(
				await api(
					"GET",
					`${timeRoot}/weeks?from=2026-10-19&to=2026-10-19`,
					undefined,
					member.key,
				)
			).weeks[0].version,
			afterEdit.version,
		);
		await page.getByRole("button", { name: "Cancel", exact: true }).click();
		console.log(
			"PASS: delayed edit preselection, unchanged entry save, explicit new-task choice and project-switch reset/required validation.",
		);
		assert.equal(
			await page.getByLabel("Week starting").inputValue(),
			"2026-10-19",
		);
		await page
			.getByLabel("I confirm these entries are actual human time worked.")
			.check();
		await page
			.getByRole("button", { name: "Submit week for approval" })
			.click();
		await page
			.getByText("Submitted for another person to review.", { exact: false })
			.waitFor();
		assert.equal(
			await page
				.getByRole("button", { name: "Approve week", exact: true })
				.count(),
			0,
		);
		await connect(owner.key);
		await page.getByLabel("Queue for", { exact: true }).selectOption(member.id);
		await grow.getByRole("button", { name: "Update status" }).click();
		await grow.getByLabel("Move to").selectOption("VERIFY");
		await grow.getByLabel("Reason", { exact: true }).fill("Review passed");
		await grow.getByRole("button", { name: "Save status" }).click();
		await grow.getByRole("button", { name: "Update status" }).click();
		await grow.getByLabel("Move to").selectOption("DONE");
		await grow
			.getByLabel("Reason", { exact: true })
			.fill("Device check passed locally");
		await grow.getByLabel("Acceptance checks passed").check();
		await grow.getByRole("button", { name: "Save status" }).click();
		await grow.waitFor({ state: "hidden" });
		const completed = await api(
			"GET",
			`/v1/tasks/${pairs[0].task.id}/delivery`,
			undefined,
			owner.key,
		);
		assert.equal(completed.stage, "DONE");
		assert.equal(completed.details.deployed, false);
		assert.equal(completed.details.device_accepted, false);
		await viewHours(true);
		await page
			.getByLabel("Reason (required", { exact: false })
			.fill("Clarify the Grow half hour");
		await page.getByRole("button", { name: "Return with reason" }).click();
		await page
			.getByRole("button", { name: "Show audit trail & return reasons" })
			.click();
		await page
			.getByText("Clarify the Grow half hour", { exact: true })
			.waitFor();
		await connect(member.key);
		await viewHours();
		await page
			.getByLabel("Reason (required", { exact: false })
			.fill("Clarified device QA");
		await page.getByRole("button", { name: "Create revision" }).click();
		await page
			.getByLabel("I confirm these entries are actual human time worked.")
			.check();
		await page
			.getByRole("button", { name: "Submit week for approval" })
			.click();
		await page
			.getByText("Submitted for another person to review.", { exact: false })
			.waitFor();
		await connect(owner.key);
		await viewHours(true);
		await page
			.getByLabel("Approved minutes: Grow device QA", { exact: true })
			.fill("60");
		await page
			.getByLabel("Reason (required", { exact: false })
			.fill("Thirty minutes duplicated");
		await page
			.getByLabel("I have reviewed every entry and the approved minutes.")
			.check();
		await page
			.getByRole("button", { name: "Approve week", exact: true })
			.click();
		await page
			.getByText("Approval reason: Thirty minutes duplicated")
			.waitFor();
		const weeks = (
			await api(
				"GET",
				`${timeRoot}/weeks?from=2026-10-19&to=2026-10-19&user_id=all`,
				undefined,
				owner.key,
			)
		).weeks;
		assert.equal(weeks.length, 1);
		assert.equal(weeks[0].entries.length, 2);
		assert.equal(
			weeks[0].entries.reduce(
				(n: number, e: { minutes: number }) => n + e.minutes,
				0,
			),
			210,
		);
		assert.equal(
			weeks[0].approval.entries.reduce(
				(n: number, e: { approved_minutes: number }) => n + e.approved_minutes,
				0,
			),
			180,
		);
		assert.equal(weeks[0].revision, 2);
		assert.equal(weeks[0].payment_status, "manual_unrecorded");
		const download = page.waitForEvent("download");
		await page.getByRole("button", { name: "Export this week as CSV" }).click();
		const csv = await download;
		await csv.saveAs(`${output}/hours.csv`);
		assert.match(
			await readFile(`${output}/hours.csv`, "utf8"),
			/submitted_minutes/,
		);
		await page.screenshot({
			path: `${output}/approval-desktop.png`,
			fullPage: true,
		});
		await page.setViewportSize({ width: 390, height: 844 });
		await page.evaluate(
			() => (document.documentElement.dataset.theme = "dark"),
		);
		assert.equal(
			await page.evaluate(
				() => document.documentElement.scrollWidth > window.innerWidth,
			),
			false,
		);
		await page.screenshot({
			path: `${output}/approval-mobile-dark.png`,
			fullPage: true,
		});
		const stored = await page.evaluate(() =>
			JSON.stringify({ ...localStorage, ...sessionStorage }),
		);
		assert.equal(
			stored.includes(member.key) || stored.includes(owner.key),
			false,
		);
		await page.getByRole("button", { name: "Disconnect & clear key" }).click();
		await page.reload();
		await page.getByRole("heading", { name: "Connect your work." }).waitFor();
		assert.deepEqual(errors, []);
		console.log(
			"PASS: actual task start/review/verify/done; stale-version reload; Grow + Veloura human entries; submission; no self-approval UI; lost-response exact retry without duplicate time; return/revise; adjusted approval; CSV; desktop/mobile; no persistent keys. Synthetic local data only.",
		);
	}
} finally {
	await browser?.close();
	server?.stop(true);
	await runtime.dispose();
}
