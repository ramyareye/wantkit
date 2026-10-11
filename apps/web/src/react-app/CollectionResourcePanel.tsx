import type { ReactNode } from "react";
import { useLocale } from "./locale-context";
import type { ResourcePhase } from "./use-collection-resource";
export interface PanelStatus {
	phase: ResourcePhase;
	retry: () => void;
}
export function CollectionResourcePanel({
	status,
	label,
	children,
}: {
	status: PanelStatus;
	label: string;
	children: ReactNode;
}) {
	const { t } = useLocale();
	if (status.phase === "error")
		return (
			<div className="collection-panel-notice" role="alert">
				<p>{t("panel.loadError", { panel: label })}</p>
				<button type="button" className="text-action" onClick={status.retry}>
					{t("common.retry")}
				</button>
			</div>
		);
	if (status.phase !== "ready")
		return (
			<p className="collection-panel-notice" role="status">
				{t("panel.loading", { panel: label })}
			</p>
		);
	return children;
}
