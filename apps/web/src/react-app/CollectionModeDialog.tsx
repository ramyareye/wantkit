import { useState, type FormEvent } from "react";
import type {
	CollectionModeResponse,
	CollectionModeUpdateInput,
} from "@wantkit/contracts";
import { collectionModes, type CollectionMode } from "@wantkit/domain";
import { useLocale } from "./locale-context";
import { EditorDialog, FormActions } from "./planning-forms";
interface ModeDialogProps {
	response: CollectionModeResponse;
	busy: boolean;
	loading: boolean;
	error: string | null;
	unavailable: boolean;
	onRetry: () => void;
	onClose: () => void;
	onSubmit: (value: CollectionModeUpdateInput) => Promise<boolean>;
}
export function CollectionModeDialog(props: ModeDialogProps) {
	const { t } = useLocale();
	return (
		<EditorDialog
			busy={props.busy}
			title={t("mode.settingsTitle")}
			description={t("mode.settingsDescription")}
			onClose={props.onClose}
		>
			<ModeFields
				key={`${props.response.settings.collectionId}:${props.response.settings.revision}`}
				{...props}
			/>
		</EditorDialog>
	);
}
function ModeFields({
	response,
	busy,
	loading,
	unavailable,
	onRetry,
	error,
	onClose,
	onSubmit,
}: ModeDialogProps) {
	const { t } = useLocale();
	const [mode, setMode] = useState<CollectionMode>(
		response.settings.effectiveMode,
	);
	const disabled =
		busy || loading || unavailable || !response.permissions.canEdit;
	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!disabled)
			await onSubmit({ mode, expectedRevision: response.settings.revision });
	}
	return (
		<form className="editor-form" onSubmit={submit}>
			<label className="field">
				<span className="field__label">{t("mode.label")}</span>
				<select
					autoFocus
					value={mode}
					disabled={disabled}
					onChange={(event) => setMode(event.target.value as CollectionMode)}
				>
					{collectionModes.map((value) => (
						<option key={value} value={value}>
							{t(`mode.${value}`)}
						</option>
					))}
				</select>
			</label>
			<p className="field-hint">{t(`mode.${mode}Description`)}</p>
			{response.settings.source === "legacy" ? (
				<p className="field-hint">{t("mode.legacy")}</p>
			) : null}
			{!response.permissions.canEdit ? (
				<p role="status">{t("mode.readOnly")}</p>
			) : null}
			{error ? (
				<p className="field-error" role="alert">
					{error}
				</p>
			) : null}
			{loading ? <p role="status">{t("mode.loading")}</p> : null}
			{unavailable ? (
				<div role="alert">
					<p>{t("panel.loadError", { panel: t("mode.label") })}</p>
					<button type="button" className="text-action" onClick={onRetry}>
						{t("common.retry")}
					</button>
				</div>
			) : null}
			<FormActions
				busy={busy}
				submitDisabled={disabled}
				onCancel={onClose}
				submitLabel={t("common.save")}
			/>
		</form>
	);
}
