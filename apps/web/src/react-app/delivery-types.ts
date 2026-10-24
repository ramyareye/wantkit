export type Workspace = { id: string; name: string; role: string };
export type Person = {
	user_id: string;
	display_name: string | null;
	email: string;
	role: string;
};
export type Project = { id: string; name: string };
export type Task = {
	id: string;
	title: string;
	project_id: string | null;
	assignee_user_id: string | null;
	status: string;
};
export type Stage =
	| "BACKLOG"
	| "READY"
	| "ACTIVE"
	| "BLOCKED"
	| "REVIEW"
	| "VERIFY"
	| "DONE"
	| "ARCHIVED";
export type DeliveryCard = Task & {
	version: number;
	stage: Stage;
	effective_stage: Stage;
	reviewer_user_id: string | null;
	can_start: boolean;
	readiness_issues: string[];
	blocker: {
		owner_user_id: string;
		reason: string;
		next_action: string;
	} | null;
	depends_on: { id: string; title: string; satisfied: boolean }[];
	details: {
		outcome: string;
		scope: string;
		next_action: string;
		repository: string;
		contract_refs: string[];
		acceptance_checks: string[];
		evidence: string[];
		build_ref: string;
		source_complete: boolean;
		deployed: boolean;
		verification_passed: boolean;
		device_accepted: boolean;
		integration_mode: string;
		exclusions: string[];
	};
};
export type Queue = {
	active: DeliveryCard[];
	active_conflict: boolean;
	ready_alternatives: DeliveryCard[];
	ready_count: number;
	missing_ready_alternatives: number;
	blocked: DeliveryCard[];
	review: DeliveryCard[];
	verify: DeliveryCard[];
};
export type Settings = {
	settings: { timezone: string; week_start: number; version: number } | null;
	access: { user_id: string; can_approve: boolean; can_configure: boolean };
};
export type Entry = {
	id: string;
	project_id: string;
	task_id: string;
	work_date: string;
	activity: string;
	minutes: number;
	note: string;
	evidence_ref?: string | null;
};
export type Week = {
	id: string;
	workspace_id: string;
	user_id: string;
	week_start_date: string;
	timezone: string;
	week_start: number;
	version: number;
	revision: number;
	state: "draft" | "submitted" | "approved" | "changes_requested";
	entries: Entry[];
	submission: {
		at: string;
		over_cap: boolean;
		cap_minutes: number | null;
	} | null;
	approval: {
		at: string;
		actor_user_id: string;
		reason: string | null;
		over_cap_decision: string | null;
		cap_minutes: number | null;
		entries: {
			entry_id: string;
			submitted_minutes: number;
			approved_minutes: number;
			amount_minor: number | null;
			terms: {
				currency: string | null;
				minor_unit_scale: number | null;
			} | null;
		}[];
	} | null;
	payment_status: "manual_unrecorded";
};
export type History = {
	id: string;
	actor_user_id: string;
	action: string;
	reason: string | null;
	version: number;
	created_at: string;
	document: Week;
};
export type Page = {
	pagination: { next_cursor: string | null; has_more: boolean };
};

export type TaskHistoryEntry = {
	id: string;
	actor: {
		user_id: string;
		email: string | null;
		display_name: string | null;
	} | null;
	change_type: string;
	created_at: string;
	from_value: unknown;
	to_value: unknown;
	metadata: unknown;
};
