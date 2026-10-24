import type { DeliveryCard } from "./delivery-types";
export type Portfolio = {
	version: number;
	project_ids: string[];
	focus_task_id: string | null;
	paused: boolean;
	resume_note: string;
	timezone: string;
	projects: {
		id: string;
		name: string;
		workspace_id: string;
		workspace_name: string;
	}[];
	active_priority: (DeliveryCard & { workspace_id: string }) | null;
	other_active: (DeliveryCard & { workspace_id: string })[];
	active_conflict: boolean;
	ready_alternatives: (DeliveryCard & { workspace_id: string })[];
	blocked: (DeliveryCard & { workspace_id: string })[];
	review: DeliveryCard[];
	verify: DeliveryCard[];
	availability: { date: string; minutes: number | null }[];
	progress: {
		id: string;
		task_id: string;
		title: string;
		date: string;
		reason: string;
		stage: string | null;
	}[];
};
export function availabilityCommand(data: FormData, dates: string[]) {
	return dates.map((date) => {
		const raw = String(data.get(date) ?? "").trim();
		const minutes = raw === "" ? null : Number(raw);
		if (
			minutes !== null &&
			(!Number.isInteger(minutes) || minutes < 0 || minutes > 120)
		)
			throw new Error("Use whole minutes from 0 to 120, or leave a day unset.");
		return { date, minutes };
	});
}
