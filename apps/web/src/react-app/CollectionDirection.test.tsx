import type {
	ConceptMediaResponse,
	ConceptResource,
} from "@wantkit/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CollectionMode } from "@wantkit/domain";
import { CollectionBriefForm } from "./collection-direction-forms";
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
function render({ failedBrief = false, failedConcept = false, mode = "home", homeDetailsOpen = false, allowHomeDetails = true }:
 {failedBrief?: boolean; failedConcept?: boolean; mode?: CollectionMode; homeDetailsOpen?: boolean; allowHomeDetails?: boolean} = {}) {
	return renderToStaticMarkup(
		<LocaleProvider initialLocale="en">
			<CollectionDirection
                collectionId="collection"
                mode={mode}
                homeDetailsOpen={homeDetailsOpen}
                allowHomeDetails={allowHomeDetails}
                onHomeDetailsToggle={() => {}}
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


describe("Shared brief and retained Home content", () => {
 it("keeps the General brief and reference images available without showing Home concepts", () => {
  const html = render({ mode: "general" });
  expect(html).toContain("Brief &amp; references");
  expect(html).toContain('id="concept-media-heading"');
  expect(html).toContain("Saved Home details");
  expect(html).not.toContain("Healthy concept");
 });
 it("shows saved Home content on demand and again in Home mode", () => {
  expect(render({ mode: "general", homeDetailsOpen: true })).toContain("Healthy concept");
  expect(render({ mode: "home" })).toContain("Healthy concept");
 });
 it("does not expose Home tools for an unsupported collection mode", () => {
  const html = render({ mode: "general", allowHomeDetails: false, homeDetailsOpen: true });
  expect(html).not.toContain("Saved Home details");
  expect(html).not.toContain("Healthy concept");
 });
 it.each(["general", "home"] as const)("keeps optional preference fields mounted in the %s editor", (mode) => {
  const html = renderToStaticMarkup(<LocaleProvider initialLocale="en">
   <CollectionBriefForm mode={mode} busy={false} initial={null} onClose={() => {}} onSubmit={async () => true} />
  </LocaleProvider>);
  expect(html).toContain(mode === "general" ? 'class="brief-preferences"' : 'class="brief-preferences" open=""');
  if (mode === "general") expect(html).not.toContain('class="brief-preferences" open=""');
  expect(html).toContain("Preferred brands");
  expect(html).toContain("Add core color");
  expect(html).toContain(mode === "general" ? "A reliable everyday laptop" : "A calm, practical home");
  expect(html.indexOf("General requirements")).toBeLessThan(html.indexOf("brief-preferences"));
 });
});
