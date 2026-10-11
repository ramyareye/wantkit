import { env } from "cloudflare:workers";
import { applyD1Migrations } from "cloudflare:test";
import { expect, it } from "vitest";
import { createCollectionContextSnapshot } from "../src/worker/context-service";

it("adds mode settings to populated legacy D1 without changing records or v1 exports", async () => {
	const database = env.MIGRATION_DB;
	const migration = env.TEST_MIGRATIONS.find((m) =>
		m.name.startsWith("0017_"),
	)!;
	await applyD1Migrations(
		database,
		env.TEST_MIGRATIONS.filter((m) => !m.name.startsWith("0017_")),
	);
	await database.batch(
		env.TEST_SEED_QUERIES.map((sql) => database.prepare(sql)),
	);
	await createCollectionContextSnapshot({
		database,
		collectionId: "dev-collection",
		userId: "dev-user",
		actorName: "Legacy owner",
		rateLimitSecret: env.BETTER_AUTH_SECRET,
	});
	const tables = (
		await database
			.prepare(
				"select name from sqlite_master where type='table' and name not like 'sqlite_%' and name <> 'd1_migrations' and name <> '_cf_METADATA' order by name",
			)
			.all<{ name: string }>()
	).results;
	const snapshot = async () =>
		Object.fromEntries(
			await Promise.all(
				tables.map(async ({ name }) => [
					name,
					(
						await database
							.prepare(`select * from "${name}" order by rowid`)
							.all()
					).results,
				]),
			),
		);
	const before = await snapshot();
	await expect(
		database.batch([
			...migration.queries.map((sql) => database.prepare(sql)),
			database.prepare("select * from intentional_mode_migration_failure"),
		]),
	).rejects.toThrow();
	expect(
		await database
			.prepare(
				"select name from sqlite_master where name='collection_mode_settings'",
			)
			.first(),
	).toBeNull();
	expect(await snapshot()).toEqual(before);
	await applyD1Migrations(database, [migration]);
	expect(await snapshot()).toEqual(before);
	expect(
		await database
			.prepare("select count(*) as n from collection_mode_settings")
			.first("n"),
	).toBe(0);
	await database
		.prepare(
			"insert into collection_mode_settings (collection_id, workspace_id, mode, revision, updated_by_user_id) values ('dev-collection', 'dev-workspace', 'home', 1, 'dev-user')",
		)
		.run();
	await expect(
		database
			.prepare(
				"update collection_mode_settings set workspace_id = 'other-workspace'",
			)
			.run(),
	).rejects.toThrow();
	await expect(
		database.prepare("update collection_mode_settings set mode = 'food'").run(),
	).rejects.toThrow();
	await expect(
		database.prepare("update collection_mode_settings set revision = 0").run(),
	).rejects.toThrow();
	expect(
		(await database.prepare("PRAGMA foreign_key_check").all()).results,
	).toEqual([]);
});
