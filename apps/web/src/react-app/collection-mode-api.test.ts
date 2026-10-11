import { afterEach, describe, expect, it, vi } from "vitest";
import { planningApi } from "./planning-api";

const response = {
	settings: {
		collectionId: "collection",
		workspaceId: "workspace",
		source: "configured",
		mode: "home",
		effectiveMode: "home",
		revision: 3,
		updatedByUserId: "editor",
		updatedAt: "2026-10-04T10:00:00.000Z",
	},
	permissions: { canEdit: true },
};
afterEach(() => vi.unstubAllGlobals());
describe("Collection mode client", () => {
	it("uses the dedicated scoped endpoint and sends the reviewed revision", async () => {
		const fetch = vi.fn().mockResolvedValue(Response.json(response));
		vi.stubGlobal("fetch", fetch);
		expect(
			await planningApi.updateCollectionMode("collection/one", {
				mode: "home",
				expectedRevision: 2,
			}),
		).toEqual(response);
		expect(fetch).toHaveBeenCalledWith(
			"/api/collections/collection%2Fone/mode",
			{
				method: "PATCH",
				credentials: "same-origin",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ mode: "home", expectedRevision: 2 }),
			},
		);
	});
	it("retains a future mode with its shared read fallback", async () => {
		const future = {
			...response,
			settings: {
				...response.settings,
				source: "unsupported",
				mode: "food",
				effectiveMode: "general",
			},
			permissions: { canEdit: false },
		};
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(future)));
		expect(await planningApi.readCollectionMode("collection")).toEqual(future);
	});
	it("propagates conflicts instead of treating a stale edit as saved", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					Response.json(
						{
							error: { code: "CONFLICT", message: "Changed by another editor" },
						},
						{ status: 409 },
					),
				),
		);
		await expect(
			planningApi.updateCollectionMode("collection", {
				mode: "general",
				expectedRevision: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT", status: 409 });
	});
});
