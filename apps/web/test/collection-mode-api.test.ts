import { env, exports } from "cloudflare:workers";
import {
	collectionModeResponseSchema,
	collectionResponseSchema,
	contextSnapshotResponseSchema,
} from "@wantkit/contracts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCollection } from "../src/worker/core-workspace-service";
import {
	readCollectionMode,
	updateCollectionMode,
} from "../src/worker/collection-mode-service";

const workspaceId = "mode-fixture-workspace";
const collectionId = "mode-fixture-collection";
const owner = "mode-fixture-user";
const actor = (userId = owner) => ({ database: env.DB, collectionId, userId });
const users = [
	owner,
	"mode-editor",
	"mode-contributor",
	"mode-viewer",
	"mode-scoped",
	"mode-outsider",
];

async function cookie(userId: string) {
	const token = `mode-token-${userId}`;
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(env.BETTER_AUTH_SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(token),
	);
	return `better-auth.session_token=${token}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
}
async function request(
	path: string,
	method = "GET",
	body?: unknown,
	userId = owner,
	origin = "http://example.com",
) {
	return exports.default.fetch(
		new Request(`http://example.com/api${path}`, {
			method,
			headers: {
				origin,
				cookie: await cookie(userId),
				"content-type": "application/json",
			},
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	);
}
const read = async (id = collectionId, userId = owner) => {
	const response = await request(
		`/collections/${id}/mode`,
		"GET",
		undefined,
		userId,
	);
	expect(response.status, await response.clone().text()).toBe(200);
	expect(response.headers.get("cache-control")).toBe("no-store");
	return collectionModeResponseSchema.parse(await response.json());
};
const edit = (
	mode: "home" | "general",
	expectedRevision: number,
	userId = owner,
) =>
	request(
		`/collections/${collectionId}/mode`,
		"PATCH",
		{ mode, expectedRevision },
		userId,
	);

beforeEach(async () => {
	await env.DB.prepare("delete from workspaces where id = ?")
		.bind(workspaceId)
		.run();
	await env.DB.prepare("delete from user where id like 'mode-%'").run();
	await env.DB.batch(
		env.TEST_SEED_QUERIES.map((sql) =>
			env.DB.prepare(sql.replaceAll("dev-", "mode-fixture-")),
		),
	);
	const now = Date.now();
	for (const userId of users) {
		await env.DB.batch([
			env.DB.prepare(
				"insert or ignore into user (id, name, email, email_verified) values (?, ?, ?, 1)",
			).bind(userId, userId, `${userId}@example.com`),
			env.DB.prepare(
				"insert into session (id, token, user_id, expires_at, updated_at) values (?, ?, ?, ?, ?)",
			).bind(
				`mode-session-${userId}`,
				`mode-token-${userId}`,
				userId,
				now + 3600000,
				now,
			),
		]);
	}
	for (const [userId, role] of [
		["mode-editor", "editor"],
		["mode-contributor", "contributor"],
		["mode-viewer", "viewer"],
	]) {
		await env.DB.prepare(
			"insert into workspace_memberships (id, workspace_id, user_id, role) values (?, ?, ?, ?)",
		)
			.bind(`membership-${userId}`, workspaceId, userId, role)
			.run();
	}
	await env.DB.prepare(
		"insert into collection_memberships (id, collection_id, user_id, role) values ('mode-scope', ?, 'mode-scoped', 'editor')",
	)
		.bind(collectionId)
		.run();
	await env.DB.prepare(
		"insert into collections (id, workspace_id, name, created_by_user_id) values ('mode-sibling', ?, 'Private sibling', ?)",
	)
		.bind(workspaceId, owner)
		.run();
});
afterEach(() => vi.restoreAllMocks());

// Run a real D1 mutation after the preliminary read but before the guarded SQL write.
function beforeModeWrite(change: () => Promise<unknown>) {
	const prepare = env.DB.prepare.bind(env.DB);
	const spy = vi.spyOn(env.DB, "prepare").mockImplementation((sql) => {
		const statement = prepare(sql);
		if (!sql.startsWith("insert into collection_mode_settings"))
			return statement;
		return new Proxy(statement, {
			get(target, key) {
				if (key === "bind")
					return (...values: unknown[]) => {
						const bound = target.bind(...values);
						return new Proxy(bound, {
							get(inner, name) {
								if (name === "first")
									return async () => {
										spy.mockRestore();
										await change();
										return inner.first();
									};
								return Reflect.get(inner, name);
							},
						});
					};
				return Reflect.get(target, key);
			},
		});
	});
}

describe("collection mode settings", () => {
	it("preserves legacy Home without backfilling and keeps Collection output strict", async () => {
		expect(await read()).toMatchObject({
			settings: {
				source: "legacy",
				mode: null,
				effectiveMode: "home",
				revision: 0,
				updatedAt: null,
				updatedByUserId: null,
			},
			permissions: { canEdit: true },
		});
		expect(
			await env.DB.prepare(
				"select count(*) as n from collection_mode_settings",
			).first("n"),
		).toBe(0);
		const response = await request(`/collections/${collectionId}`);
		const body = collectionResponseSchema.parse(await response.json());
		expect(body.collection).not.toHaveProperty("mode");
	});

	it("creates General for old clients and explicit Home with atomic settings", async () => {
		for (const mode of [undefined, "home"] as const) {
			const response = await request(
				`/workspaces/${workspaceId}/collections`,
				"POST",
				{ name: "New plan", ...(mode ? { mode } : {}) },
			);
			expect(response.status, await response.clone().text()).toBe(201);
			const { collection } = collectionResponseSchema.parse(
				await response.json(),
			);
			expect(await read(collection.id)).toMatchObject({
				settings: {
					mode: mode ?? "general",
					source: "configured",
					revision: 1,
					updatedByUserId: owner,
				},
			});
		}
	});

	it("rolls back collection creation if settings persistence fails", async () => {
		await env.DB.prepare(
			"create trigger mode_creation_failure before insert on collection_mode_settings begin select raise(abort, 'mode failure'); end",
		).run();
		try {
			await expect(
				createCollection({
					database: env.DB,
					userId: owner,
					workspaceId,
					value: { name: "Must roll back" },
				}),
			).rejects.toThrow();
			expect(
				await env.DB.prepare(
					"select count(*) as n from collections where name = 'Must roll back'",
				).first("n"),
			).toBe(0);
		} finally {
			await env.DB.prepare("drop trigger mode_creation_failure").run();
		}
	});

	it.each(["permission", "archive"])(
		"rechecks %s before atomic collection creation",
		async (change) => {
			const batch = env.DB.batch.bind(env.DB);
			const spy = vi
				.spyOn(env.DB, "batch")
				.mockImplementationOnce(async (statements) => {
					spy.mockRestore();
					if (change === "permission") {
						await env.DB.prepare(
							"update workspace_memberships set role = 'contributor' where workspace_id = ? and user_id = ?",
						)
							.bind(workspaceId, owner)
							.run();
					} else {
						await env.DB.prepare(
							"update workspaces set archived_at = 1 where id = ?",
						)
							.bind(workspaceId)
							.run();
					}
					return batch(statements);
				});
			await expect(
				createCollection({
					database: env.DB,
					userId: owner,
					workspaceId,
					value: { name: "No unauthorized plan" },
				}),
			).rejects.toMatchObject({
				code: change === "permission" ? "FORBIDDEN" : "RESOURCE_ARCHIVED",
			});
			expect(
				await env.DB.prepare(
					"select count(*) as n from collections where name = 'No unauthorized plan'",
				).first("n"),
			).toBe(0);
			expect(
				await env.DB.prepare(
					"select count(*) as n from collection_mode_settings",
				).first("n"),
			).toBe(0);
		},
	);

	it("limits reads to the granted collection and denies Contributor/Viewer edits", async () => {
		for (const userId of ["mode-contributor", "mode-viewer"]) {
			expect((await read(collectionId, userId)).permissions.canEdit).toBe(
				false,
			);
			expect((await edit("general", 0, userId)).status).toBe(403);
		}
		expect(
			(
				await request(
					`/collections/${collectionId}/mode`,
					"GET",
					undefined,
					"mode-outsider",
				)
			).status,
		).toBe(404);
		expect(
			(
				await request(
					"/collections/mode-sibling/mode",
					"GET",
					undefined,
					"mode-scoped",
				)
			).status,
		).toBe(404);
		expect((await edit("general", 0, "mode-scoped")).status).toBe(200);
		expect((await edit("home", 1, "mode-editor")).status).toBe(200);
	});

	it("rejects unsupported inputs, bypasses, foreign Origins and anonymous access", async () => {
		for (const body of [
			{ mode: "food", expectedRevision: 0 },
			{ mode: "general" },
			{ mode: "home", expectedRevision: -1 },
			{ mode: "home", expectedRevision: 0, extra: true },
		])
			expect(
				(await request(`/collections/${collectionId}/mode`, "PATCH", body))
					.status,
			).toBe(400);
		expect(
			(
				await request(`/collections/${collectionId}`, "PATCH", {
					mode: "general",
				})
			).status,
		).toBe(400);
		expect(
			(
				await request(
					`/collections/${collectionId}/mode`,
					"PATCH",
					{ mode: "general", expectedRevision: 0 },
					owner,
					"https://foreign.example",
				)
			).status,
		).toBe(403);
		expect(
			(
				await exports.default.fetch(
					new Request(
						`http://example.com/api/collections/${collectionId}/mode`,
					),
				)
			).status,
		).toBe(401);
	});

	it.each(["collections", "workspaces"])(
		"allows archived reads but rejects edits for %s",
		async (table) => {
			await env.DB.prepare(`update ${table} set archived_at = 1 where id = ?`)
				.bind(table === "collections" ? collectionId : workspaceId)
				.run();
			expect((await read()).permissions.canEdit).toBe(false);
			const response = await edit("general", 0);
			expect(response.status).toBe(409);
			expect(await response.json()).toMatchObject({
				error: { code: "RESOURCE_ARCHIVED" },
			});
		},
	);

	it("accepts only one concurrent revision and records the winning actor", async () => {
		const results = await Promise.all([
			edit("general", 0),
			edit("home", 0, "mode-editor"),
		]);
		expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
		const winner = collectionModeResponseSchema.parse(
			await results.find((r) => r.status === 200)!.json(),
		);
		expect(await read()).toEqual(winner);
		expect(winner.settings.revision).toBe(1);
		expect((await edit("general", 0)).status).toBe(409);
	});

	it("rechecks revoked access and archive state inside the write", async () => {
		beforeModeWrite(() =>
			env.DB.prepare(
				"delete from workspace_memberships where user_id = 'mode-editor'",
			).run(),
		);
		await expect(
			updateCollectionMode({
				...actor("mode-editor"),
				value: { mode: "general", expectedRevision: 0 },
			}),
		).rejects.toMatchObject({ status: 404 });
		expect((await read()).settings.revision).toBe(0);
		beforeModeWrite(() =>
			env.DB.prepare("update collections set archived_at = 1 where id = ?")
				.bind(collectionId)
				.run(),
		);
		await expect(
			updateCollectionMode({
				...actor(),
				value: { mode: "general", expectedRevision: 0 },
			}),
		).rejects.toMatchObject({ code: "RESOURCE_ARCHIVED" });
		expect((await read()).settings.revision).toBe(0);
	});

	it("retains a future identifier with shared fallback and blocks older-client overwrites", async () => {
		// Simulate a future schema's read result without widening today's storage constraint.
		const prepare = env.DB.prepare.bind(env.DB);
		vi.spyOn(env.DB, "prepare").mockImplementation((sql) => {
			const statement = prepare(sql);
			if (!sql.includes("left join collection_mode_settings")) return statement;
			return new Proxy(statement, {
				get(target, key) {
					if (key === "bind")
						return () =>
							new Proxy(target, {
								get(inner, name) {
									if (name === "first")
										return async () => ({
											collection_id: collectionId,
											workspace_id: workspaceId,
											archived_at: null,
											workspace_archived_at: null,
											mode: "food",
											revision: 2,
											updated_by_user_id: owner,
											updated_at: 1234,
										});
									return Reflect.get(inner, name);
								},
							});
					return Reflect.get(target, key);
				},
			});
		});
		expect(await readCollectionMode(actor())).toMatchObject({
			settings: {
				source: "unsupported",
				mode: "food",
				effectiveMode: "general",
				revision: 2,
			},
			permissions: { canEdit: false },
		});
		await expect(
			updateCollectionMode({
				...actor(),
				value: { mode: "home", expectedRevision: 2 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("round-trips Home without changing existing content or historical v1 snapshots", async () => {
		const old = await request(
			`/collections/${collectionId}/context-snapshots`,
			"POST",
		);
		expect(old.status, await old.clone().text()).toBe(201);
		const historical = contextSnapshotResponseSchema.parse(
			await old.json(),
		).snapshot;
		const tables = [
			"collections",
			"items",
			"products",
			"item_candidates",
			"offers",
			"price_checks",
			"decision_events",
			"collection_briefs",
			"collection_brief_colors",
			"concepts",
			"concept_images",
			"floor_plans",
			"context_snapshots",
		];
		const snapshot = async () =>
			Object.fromEntries(
				await Promise.all(
					tables.map(async (table) => [
						table,
						(
							await env.DB.prepare(
								`select * from ${table} order by rowid`,
							).all()
						).results,
					]),
				),
			);
		const before = await snapshot();
		for (const [mode, revision] of [
			["home", 0],
			["general", 1],
			["home", 2],
		] as const)
			expect((await edit(mode, revision)).status).toBe(200);
		expect((await read()).settings).toMatchObject({
			mode: "home",
			revision: 3,
		});
		expect(await snapshot()).toEqual(before);
		const response = await request(`/context-snapshots/${historical.id}`);
		expect(
			contextSnapshotResponseSchema.parse(await response.json()).snapshot,
		).toEqual(historical);
		const fresh = await request(
			`/collections/${collectionId}/context-snapshots`,
			"POST",
		);
		const newer = contextSnapshotResponseSchema.parse(
			await fresh.json(),
		).snapshot;
		expect(newer.schemaVersion).toBe(1);
		expect(newer.content.collection).not.toHaveProperty("mode");
		expect(
			(await env.DB.prepare("PRAGMA foreign_key_check").all()).results,
		).toEqual([]);
	});
});
