import { collectionModes, isCollectionMode } from "@wantkit/domain";
import { z } from "zod";

export const collectionModeSchema = z.enum(collectionModes);
const revision = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const identity = {
	collectionId: z.string().min(1),
	workspaceId: z.string().min(1),
};
const provenance = {
	revision,
	updatedByUserId: z.string().min(1),
	updatedAt: z.iso.datetime(),
};

// Separate from CollectionResource: historical v1 exports retain their exact shape.
export const collectionModeSettingsSchema = z.discriminatedUnion("source", [
	z
		.object({
			...identity,
			...provenance,
			source: z.literal("configured"),
			mode: collectionModeSchema,
			effectiveMode: collectionModeSchema,
		})
		.strict()
		.refine((value) => value.mode === value.effectiveMode),
	z
		.object({
			...identity,
			source: z.literal("legacy"),
			mode: z.null(),
			effectiveMode: z.literal("home"),
			revision: z.literal(0),
			updatedByUserId: z.null(),
			updatedAt: z.null(),
		})
		.strict(),
	z
		.object({
			...identity,
			...provenance,
			source: z.literal("unsupported"),
			mode: z
				.string()
				.regex(/^[a-z][a-z0-9_-]{0,31}$/)
				.refine((value) => !isCollectionMode(value)),
			effectiveMode: z.literal("general"),
		})
		.strict(),
]);

export const collectionModeUpdateInputSchema = z
	.object({
		mode: collectionModeSchema,
		expectedRevision: z
			.number()
			.int()
			.min(0)
			.max(Number.MAX_SAFE_INTEGER - 1),
	})
	.strict();

export const collectionModeResponseSchema = z
	.object({
		settings: collectionModeSettingsSchema,
		permissions: z.object({ canEdit: z.boolean() }).strict(),
	})
	.strict();

export type CollectionModeSettings = z.infer<
	typeof collectionModeSettingsSchema
>;
export type CollectionModeUpdateInput = z.infer<
	typeof collectionModeUpdateInputSchema
>;
export type CollectionModeResponse = z.infer<
	typeof collectionModeResponseSchema
>;
