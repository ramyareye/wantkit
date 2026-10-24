import type { Page, Week } from "./delivery-types";

type Command = {
	method: "POST" | "PUT";
	path: string;
	body: Record<string, unknown>;
	idempotency_key: string;
};
export class DeliveryError extends Error {
	constructor(
		message: string,
		readonly status = 0,
		readonly code = "NETWORK_ERROR",
	) {
		super(message);
	}
}
// One instance per connection, private key in memory only. No persistent storage.
export class DeliveryClient {
	private pending: Command | null = null;
	private running = false;
	private controller = new AbortController();
	constructor(
		private key: string,
		private readonly send: typeof fetch = (...args) => fetch(...args),
	) {}
	get needsRetry() {
		return this.pending !== null;
	}
	disconnect() {
		this.key = "";
		this.pending = null;
		this.controller.abort();
	}
	private async request<T>(envelope: {
		method: string;
		path: string;
		body?: unknown;
		idempotency_key?: string;
	}): Promise<T> {
		if (!this.key) throw new DeliveryError("Reconnect to Todoless.", 401);
		const response = await this.send("/api/delivery/request", {
			method: "POST",
			credentials: "same-origin",
			cache: "no-store",
			headers: {
				"content-type": "application/json",
				"x-todoless-key": this.key,
			},
			body: JSON.stringify(envelope),
			signal: AbortSignal.any([
				this.controller.signal,
				AbortSignal.timeout(25_000),
			]),
		});
		if (
			response.ok &&
			response.headers.get("content-type")?.includes("text/csv")
		)
			return (await response.text()) as T;
		let value: {
			success?: boolean;
			data?: T;
			error?: { code?: string; message?: string };
		};
		try {
			value = await response.json();
		} catch {
			throw new DeliveryError(
				"Unexpected response. Retry the same action.",
				502,
			);
		}
		if (!response.ok || value.success !== true)
			throw new DeliveryError(
				value.error?.message ?? "Delivery request failed.",
				response.status,
				value.error?.code,
			);
		return value.data as T;
	}
	get<T>(path: string) {
		return this.request<T>({ method: "GET", path });
	}
	async all<T>(path: string, field: string): Promise<T[]> {
		const result: T[] = [];
		let cursor: string | null = null;
		const seen = new Set<string>();
		do {
			const data: Page & Record<string, unknown> = await this.get(
				`${path}${path.includes("?") ? "&" : "?"}limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
			);
			result.push(...(data[field] as T[]));
			cursor = data.pagination?.has_more ? data.pagination.next_cursor : null;
			if (
				(data.pagination?.has_more && (!cursor || seen.has(cursor))) ||
				result.length > 5000
			)
				throw new DeliveryError("Too many records. Narrow the selected range.");
			if (cursor) seen.add(cursor);
		} while (cursor);
		return result;
	}
	async mutate<T>(
		method: "POST" | "PUT",
		path: string,
		body: Record<string, unknown>,
	): Promise<T> {
		if (this.pending)
			throw new DeliveryError("Retry the pending action first.");
		this.pending = {
			method,
			path,
			body: structuredClone(body),
			idempotency_key: crypto.randomUUID(),
		};
		return this.retry<T>();
	}
	async retry<T>(): Promise<T> {
		if (this.running || !this.pending)
			throw new DeliveryError(
				"An action is already running, or there is nothing to retry.",
			);
		this.running = true;
		try {
			const result = await this.request<T>(this.pending);
			this.pending = null;
			return result;
		} catch (error) {
			// Definitive rejections cannot have committed. Unknown outcomes keep the exact command/key.
			if (
				error instanceof DeliveryError &&
				((error.status >= 400 && error.status < 500) ||
					error.code === "DELIVERY_NOT_CONFIGURED")
			)
				this.pending = null;
			throw error;
		} finally {
			this.running = false;
		}
	}
}
export function addDays(date: string, days: number) {
	const value = new Date(`${date}T12:00:00Z`);
	value.setUTCDate(value.getUTCDate() + days);
	return value.toISOString().slice(0, 10);
}
export function hours(minutes: number) {
	return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
export function currentWeek(timezone: string, start: number, now = new Date()) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(now);
	const part = (name: string) => parts.find((p) => p.type === name)!.value;
	const date = `${part("year")}-${part("month")}-${part("day")}`;
	return addDays(
		date,
		-((new Date(`${date}T12:00:00Z`).getUTCDay() - start + 7) % 7),
	);
}
export function canApprove(week: Week, userId: string, approver: boolean) {
	return approver && week.user_id !== userId && week.state === "submitted";
}
export function approvalCommand(
	week: Week,
	minutes: Record<string, string>,
	reason: string,
	overCap: boolean,
) {
	const entries = week.entries.map((entry) => ({
		entry_id: entry.id,
		approved_minutes: Number(minutes[entry.id] ?? entry.minutes),
	}));
	if (
		entries.some(
			(entry, index) =>
				!Number.isInteger(entry.approved_minutes) ||
				entry.approved_minutes < 0 ||
				entry.approved_minutes > week.entries[index].minutes ||
				minutes[entry.entry_id]?.trim() === "",
		)
	)
		throw new Error(
			"Approved minutes must be whole minutes between zero and the submitted amount.",
		);
	if (
		entries.some(
			(entry, index) => entry.approved_minutes !== week.entries[index].minutes,
		) &&
		!reason.trim()
	)
		throw new Error("Explain the adjustment before approving.");
	return {
		action: "approve",
		version: week.version,
		entries,
		...(reason.trim() ? { reason: reason.trim() } : {}),
		...(overCap ? { over_cap_decision: "approve" } : {}),
	};
}
