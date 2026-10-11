import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CollectionModeResponse } from "@wantkit/contracts";
import { CollectionModeDialog } from "./CollectionModeDialog";
import { LocaleProvider } from "./LocaleProvider";

const response: CollectionModeResponse = {
	settings: {
		collectionId: "collection",
		workspaceId: "workspace",
		source: "legacy",
		mode: null,
		effectiveMode: "home",
		revision: 0,
		updatedByUserId: null,
		updatedAt: null,
	},
	permissions: { canEdit: true },
};
describe("Mode settings interaction states", () => {
	it.each(["en", "fa"] as const)(
		"keeps Cancel available while refreshing in %s",
		(locale) => {
			const html = renderToStaticMarkup(
				<LocaleProvider initialLocale={locale}>
					<CollectionModeDialog
						response={response}
						busy={false}
						loading
						unavailable={false}
						error={null}
						onRetry={() => {}}
						onClose={() => {}}
						onSubmit={async () => true}
					/>
				</LocaleProvider>,
			);
			expect(html).toMatch(/<select[^>]*disabled=""/);
			expect(html).toMatch(/type="submit"[^>]+disabled=""/);
			expect(html).toMatch(/class="button button--quiet">/);
			expect(html).toContain('value="home" selected=""');
		},
	);
	it("does not offer a writable selector for an unsupported mode", () => {
		const future: CollectionModeResponse = {
			settings: {
				...response.settings,
				source: "unsupported",
				mode: "food",
				effectiveMode: "general",
				revision: 1,
				updatedAt: "2026-10-04T10:00:00.000Z",
				updatedByUserId: "editor",
			},
			permissions: { canEdit: false },
		};
		const html = renderToStaticMarkup(
			<LocaleProvider initialLocale="en">
				<CollectionModeDialog
					response={future}
					busy={false}
					loading={false}
					unavailable={false}
					error={null}
					onRetry={() => {}}
					onClose={() => {}}
					onSubmit={async () => true}
				/>
			</LocaleProvider>,
		);
		expect(html).toMatch(/<select[^>]*disabled=""/);
		expect(html).toContain('role="status"');
		expect(html).toMatch(/type="submit"[^>]+disabled=""/);
	});
});
