import { collectionModes } from "@wantkit/domain";
import { sql } from "drizzle-orm";
import {
	check,
	foreignKey,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { collections } from "./collaboration";
import { updatedAt } from "./columns";

export const collectionModeSettings = sqliteTable(
	"collection_mode_settings",
	{
		collectionId: text("collection_id").primaryKey(),
		workspaceId: text("workspace_id").notNull(),
		mode: text("mode", { enum: collectionModes }).notNull(),
		revision: integer("revision").notNull(),
		updatedByUserId: text("updated_by_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		updatedAt: updatedAt(),
	},
	(table) => [
		foreignKey({
			columns: [table.collectionId, table.workspaceId],
			foreignColumns: [collections.id, collections.workspaceId],
		}).onDelete("cascade"),
		check(
			"collection_mode_settings_mode_check",
			sql`${table.mode} in ('general', 'home')`,
		),
		check(
			"collection_mode_settings_revision_check",
			sql`typeof(${table.revision}) = 'integer' and ${table.revision} between 1 and 9007199254740991`,
		),
	],
);
