import type { ConceptResource } from "@wantkit/contracts";
import {
  CollectionResourcePanel,
  type PanelStatus,
} from "./CollectionResourcePanel";
import { useLocale } from "./locale-context";

/** Home narrative is optional composition; the shared brief and media stay independent. */
export function HomeConcept({
  concept,
  status,
  canEdit,
  busy,
  onEdit,
  onRemove,
}: {
  concept: ConceptResource | null;
  status: PanelStatus;
  canEdit: boolean;
  busy: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useLocale();
  return (
    <CollectionResourcePanel status={status} label={t("concept.label")}>
      <article
        className={
          concept ? "concept-card" : "direction-empty direction-empty--concept"
        }
      >
        {canEdit ? (
          <button
            type="button"
            className="text-action"
            onClick={onEdit}
            disabled={busy}
          >
            {concept ? t("concept.edit") : t("concept.create")}
          </button>
        ) : null}
        {concept ? (
          <>
            <header>
              <p className="eyebrow">{t("concept.label")}</p>
              <h4 dir="auto">{concept.title}</h4>
            </header>
            <p className="concept-card__narrative" dir="auto">
              {concept.narrative}
            </p>
            {canEdit ? (
              <button
                type="button"
                className="text-action text-action--danger"
                onClick={onRemove}
                disabled={busy}
              >
                {t("concept.remove")}
              </button>
            ) : null}
          </>
        ) : (
          <>
            <span aria-hidden="true">02</span>
            <div>
              <p className="eyebrow">{t("concept.label")}</p>
              <h4>{t("concept.emptyTitle")}</h4>
              <p>{t("concept.emptyBody")}</p>
            </div>
          </>
        )}
      </article>
    </CollectionResourcePanel>
  );
}
