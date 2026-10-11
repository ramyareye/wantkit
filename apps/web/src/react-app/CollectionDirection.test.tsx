import type {
	ConceptMediaResponse,
	ConceptResource,
} from "@wantkit/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CollectionDirection } from "./CollectionDirection";
import { LocaleProvider } from "./LocaleProvider";

const concept: ConceptResource = {
	id: "concept",
	collectionId: "collection",
	title: "Healthy concept",
	narrative: "Keep this successful panel available.",
	createdAt: "2026-10-04T10:00:00.000Z",
	updatedAt: "2026-10-04T10:00:00.000Z",
};
const media: ConceptMediaResponse = {
	conceptId: concept.id,
	images: [],
	permissions: { canManage: false },
	limits: {
		maxFileBytes: 1000,
		maxImageCount: 12,
		maxPixelCount: 1000,
		maxSidePixels: 1000,
		maxWorkspaceBytes: 10000,
	},
	usage: { conceptImageCount: 0, workspaceBytes: 0 },
};
function render({ failedBrief = false, failedConcept = false } = {}) {
	return renderToStaticMarkup(
		<LocaleProvider initialLocale="en">
			<CollectionDirection
				brief={null}
				concept={failedConcept ? null : concept}
				media={media}
				busy={false}
				canEditBrief={false}
				canEditConcept={false}
				briefStatus={{
					phase: failedBrief ? "error" : "ready",
					retry: () => {},
				}}
				conceptStatus={{
					phase: failedConcept ? "error" : "ready",
					retry: () => {},
				}}
				mediaStatus={{ phase: "ready", retry: () => {} }}
				onEditBrief={() => {}}
				onEditConcept={() => {}}
				onRemoveConcept={() => {}}
				onDeleteImage={async () => {}}
				onReorderImages={async () => true}
				onUpdateImage={async () => true}
				onUploadImage={async () => true}
			/>
		</LocaleProvider>,
	);
}
describe("Optional collection panel recovery", () => {
	it("keeps healthy concept and images visible when the brief fails", () => {
		const html = render({ failedBrief: true });
		expect(html).toContain("Could not load Collection Brief");
		expect(html).toContain("Try again");
		expect(html).toContain("Healthy concept");
		expect(html).toContain('id="concept-media-heading"');
	});
	it("shows successful media even if its sibling concept request fails", () => {
		const html = render({ failedConcept: true });
		expect(html).toContain("Could not load Concept");
		expect(html).toContain('id="concept-media-heading"');
		expect(html).not.toContain("Healthy concept");
	});
});
