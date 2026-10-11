import type { CollectionMode } from "@wantkit/domain";
import type { MessageKey } from "@wantkit/i18n";
export type CollectionView = "items" | "direction" | "floorPlans" | "budget";
interface CollectionPresenter {
	label: MessageKey;
	views: readonly CollectionView[];
	directionLabel: MessageKey;
}
export const collectionPresenters: Record<CollectionMode, CollectionPresenter> =
	{
		general: {
			label: "mode.general",
			views: ["items", "direction", "budget"],
			directionLabel: "nav.view.references",
		},
		home: {
			label: "mode.home",
			views: ["items", "direction", "floorPlans", "budget"],
			directionLabel: "nav.view.direction",
		},
	};
