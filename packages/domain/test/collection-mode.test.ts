import { describe, expect, it } from "vitest";
import {
	collectionModes,
	defaultCollectionMode,
	effectiveCollectionMode,
	isCollectionMode,
} from "../src";

describe("collection mode compatibility", () => {
	it("supports only implemented General/Home writes and preserves legacy/future fallbacks", () => {
		expect(defaultCollectionMode).toBe("general");
		for (const mode of collectionModes) {
			expect(isCollectionMode(mode)).toBe(true);
			expect(effectiveCollectionMode(mode)).toBe(mode);
		}
		expect(isCollectionMode("food")).toBe(false);
		expect(effectiveCollectionMode(null)).toBe("home");
		expect(effectiveCollectionMode("food")).toBe("general");
	});
});
