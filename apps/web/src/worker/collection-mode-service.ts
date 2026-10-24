import {
	collectionModeResponseSchema,
	collectionModeUpdateInputSchema,
	type CollectionModeResponse,
	type CollectionModeSettings,
	type CollectionModeUpdateInput,
} from "@wantkit/contracts";
import { hasCapability, isCollectionMode } from "@wantkit/domain";
import { conflict, notFound, resourceArchived } from "./api-errors";
import { loadCollectionAccess, requireCapability } from "./authorization";

interface SettingsRow {
	collection_id: string;
	workspace_id: string;
	mode: string;
	revision: number;
	updated_by_user_id: string;
	updated_at: number;
}
interface StateRow {
	collection_id: string;
	workspace_id: string;
	archived_at: number | null;
	workspace_archived_at: number | null;
	mode: string | null;
	revision: number | null;
	updated_by_user_id: string | null;
	updated_at: number | null;
}
type ScopeInput = {
	database: D1Database;
	userId: string;
	collectionId: string;
};

function settingsResource(row: StateRow | SettingsRow): CollectionModeSettings {
	const identity = {
		collectionId: row.collection_id,
		workspaceId: row.workspace_id,
	};
	if (row.mode === null)
		return {
			...identity,
			source: "legacy",
			mode: null,
			effectiveMode: "home",
			revision: 0,
			updatedByUserId: null,
			updatedAt: null,
		};
	if (
		row.revision === null ||
		row.updated_by_user_id === null ||
		row.updated_at === null
	)
		throw new Error("Stored collection mode settings are incomplete");
	const provenance = {
		...identity,
		revision: row.revision,
		updatedByUserId: row.updated_by_user_id,
		updatedAt: new Date(row.updated_at).toISOString(),
	};
	return isCollectionMode(row.mode)
		? {
				...provenance,
				source: "configured",
				mode: row.mode,
				effectiveMode: row.mode,
			}
		: {
				...provenance,
				source: "unsupported",
				mode: row.mode,
				effectiveMode: "general",
			};
}

async function modeState(input: ScopeInput, mutable = false) {
	const access = requireCapability(
		await loadCollectionAccess(
			input.database,
			input.userId,
			input.collectionId,
		),
		mutable ? "collection_content_edit" : "view",
	);
	const row = await input.database
		.prepare(
			`select c.id as collection_id, c.workspace_id,
		c.archived_at, w.archived_at as workspace_archived_at,
		s.mode, s.revision, s.updated_by_user_id, s.updated_at
		from collections c join workspaces w on w.id = c.workspace_id
		left join collection_mode_settings s on s.collection_id = c.id and s.workspace_id = c.workspace_id
		where c.id = ?`,
		)
		.bind(input.collectionId)
		.first<StateRow>();
	if (!row) throw notFound();
	if (mutable) {
		if (row.workspace_archived_at !== null) throw resourceArchived("Workspace");
		if (row.archived_at !== null) throw resourceArchived("Collection");
	}
	return { access, row };
}

export async function readCollectionMode(
	input: ScopeInput,
): Promise<CollectionModeResponse> {
	const { access, row } = await modeState(input);
	return collectionModeResponseSchema.parse({
		settings: settingsResource(row),
		permissions: {
			canEdit:
				row.archived_at === null &&
				row.workspace_archived_at === null &&
				(row.mode === null || isCollectionMode(row.mode)) &&
				hasCapability(access.grants, access.target, "collection_content_edit"),
		},
	});
}

export async function updateCollectionMode(
	input: ScopeInput & { value: CollectionModeUpdateInput },
): Promise<CollectionModeResponse> {
	const value = collectionModeUpdateInputSchema.parse(input.value);
	const { row } = await modeState(input, true);
	if (row.mode !== null && !isCollectionMode(row.mode))
		throw conflict(
			"This Collection uses a newer mode. Update HopKit before changing it.",
		);
	// The conditional UPSERT rechecks scope grants and archive state at write time.
	// Revision zero can only create settings for a legacy Collection.
	const updated = await input.database
		.prepare(
			`insert into collection_mode_settings
		(collection_id, workspace_id, mode, revision, updated_by_user_id, updated_at)
		select c.id, c.workspace_id, ?2, 1, ?3, ?4 from collections c
		join workspaces w on w.id = c.workspace_id
		where c.id = ?1 and c.archived_at is null and w.archived_at is null
		and (exists (select 1 from workspace_memberships actor where actor.workspace_id = c.workspace_id
			and actor.user_id = ?3 and actor.role in ('editor', 'owner'))
			or exists (select 1 from collection_memberships actor where actor.collection_id = c.id
			and actor.user_id = ?3 and actor.role in ('editor', 'owner')))
		and ((?5 = 0 and not exists (select 1 from collection_mode_settings s where s.collection_id = c.id))
			or exists (select 1 from collection_mode_settings s where s.collection_id = c.id
			and s.revision = ?5 and s.mode in ('general', 'home')))
		on conflict(collection_id) do update set mode = excluded.mode,
			revision = collection_mode_settings.revision + 1,
			updated_by_user_id = excluded.updated_by_user_id, updated_at = excluded.updated_at
		where collection_mode_settings.revision = ?5 and collection_mode_settings.mode in ('general', 'home')
		returning collection_id, workspace_id, mode, revision, updated_by_user_id, updated_at`,
		)
		.bind(
			input.collectionId,
			value.mode,
			input.userId,
			Date.now(),
			value.expectedRevision,
		)
		.first<SettingsRow>();
	if (!updated) {
		await modeState(input, true);
		throw conflict(
			"The Collection mode changed. Reload its settings before retrying.",
		);
	}
	return collectionModeResponseSchema.parse({
		settings: settingsResource(updated),
		permissions: { canEdit: true },
	});
}
