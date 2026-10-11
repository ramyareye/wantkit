import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredLocale, resolveInitialLocale } from "./locale-runtime";

afterEach(() => vi.unstubAllGlobals());

function mockBrowser(saved: Record<string, string | undefined>) {
	const root = { lang: "", dir: "" };
	vi.stubGlobal("document", { documentElement: root, title: "" });
	vi.stubGlobal("window", {
		localStorage: { getItem: (key: string) => saved[key] ?? null },
		navigator: { languages: ["en-US"] },
	});
	return root;
}

describe("locale preference after the WantKit rename", () => {
	it("preserves an existing Persian choice and direction", () => {
		const root = mockBrowser({ "kharidyar.locale": "fa" });
		expect(resolveInitialLocale()).toBe("fa");
		expect(root).toEqual({ lang: "fa", dir: "rtl" });
	});

	it("prefers the WantKit choice over an older preference", () => {
		mockBrowser({ "wantkit.locale": "en", "kharidyar.locale": "fa" });
		expect(readStoredLocale()).toBe("en");
	});

	it("recovers the older choice when the new value is invalid", () => {
		mockBrowser({ "wantkit.locale": "invalid", "kharidyar.locale": "fa" });
		expect(readStoredLocale()).toBe("fa");
	});

	it.each([{}, { "wantkit.locale": "invalid", "kharidyar.locale": "invalid" }])(
		"uses the browser language without a valid saved choice (%j)",
		(saved) => {
			mockBrowser(saved);
			expect(resolveInitialLocale()).toBe("en");
		},
	);

	it("still starts when browser storage is unavailable", () => {
		const root = mockBrowser({});
		vi.stubGlobal("window", {
			get localStorage() { throw new Error("Storage blocked"); },
			navigator: { languages: ["fa-IR"] },
		});
		expect(resolveInitialLocale()).toBe("fa");
		expect(root).toEqual({ lang: "fa", dir: "rtl" });
	});
});
