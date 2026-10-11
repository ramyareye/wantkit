/** Modes affect presentation; they never grant access or change planning records. */
export const collectionModes = ["general", "home"] as const;
export type CollectionMode = (typeof collectionModes)[number];
export const defaultCollectionMode: CollectionMode = "general";
export const legacyCollectionMode: CollectionMode = "home";

export function isCollectionMode(value: unknown): value is CollectionMode {
	return value === "general" || value === "home";
}

export function effectiveCollectionMode(mode: string | null): CollectionMode {
	if (mode === null) return legacyCollectionMode;
	return isCollectionMode(mode) ? mode : defaultCollectionMode;
}
