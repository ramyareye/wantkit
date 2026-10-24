import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { availabilityCommand } from "./portfolio-client";
import { PortfolioAvailability } from "./DeliveryPortfolio";
describe("Personal availability", () => {
	it("keeps repeated zero days distinct from unset and actual hours", () => {
		const f = new FormData();
		f.set("2026-10-19", "0");
		f.set("2026-10-20", "0");
		f.set("2026-10-21", "120");
		expect(
			availabilityCommand(f, [
				"2026-10-19",
				"2026-10-20",
				"2026-10-21",
				"2026-10-22",
			]).map((d) => d.minutes),
		).toEqual([0, 0, 120, null]);
	});
	it.each(["-1", "121", "1.5", "NaN"])(
		"rejects invalid daily minutes %s",
		(value) => {
			const f = new FormData();
			f.set("day", value);
			expect(() => availabilityCommand(f, ["day"])).toThrow();
		},
	);
	it("renders zero as a value and unset as a blank without time-approval language", () => {
		const html = renderToStaticMarkup(
			<PortfolioAvailability
				days={[
					{ date: "2026-10-19", minutes: 0 },
					{ date: "2026-10-20", minutes: null },
				]}
				save={() => {}}
			/>,
		);
		expect(html).toContain('value="0"');
		expect(html).toContain('value=""');
		expect(html).toContain("One shared budget");
		expect(html).toContain("Several zero days are fine");
	});
});
