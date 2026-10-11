import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiErrorCode } from "@wantkit/contracts";
import { PlanningApiError } from "./planning-api";
export type ResourcePhase = "idle" | "loading" | "ready" | "error";
interface ResourceState<T> {
	collectionId: string | null;
	load: (id: string) => Promise<T>;
	phase: ResourcePhase;
	data: T | null;
	error: ApiErrorCode | null;
}
/** Each optional panel owns its request, retry, and selection lifetime. */
export function useCollectionResource<T>(
	load: (id: string) => Promise<T>,
	collectionId: string | null,
	enabled = true,
) {
	const [retryVersion, setRetryVersion] = useState(0);
	const requestVersion = useRef(0);
	const activeScope = useRef({ collectionId, load });
	const [state, setState] = useState<ResourceState<T>>({
		collectionId: null,
		load,
		phase: "idle",
		data: null,
		error: null,
	});
	useEffect(() => {
		activeScope.current = { collectionId, load };
		if (!collectionId || !enabled) return;
		let active = true;
		const version = ++requestVersion.current;
		// Synchronize the panel indicator with the start of its external request.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setState((previous) => ({
			collectionId,
			load,
			phase: "loading",
			error: null,
			data:
				previous.collectionId === collectionId && previous.load === load
					? previous.data
					: null,
		}));
		void load(collectionId)
			.then((data) => {
				if (active && requestVersion.current === version)
					setState({ collectionId, load, phase: "ready", data, error: null });
			})
			.catch((error: unknown) => {
				if (active && requestVersion.current === version)
					setState((previous) => ({
						collectionId,
						load,
						phase: "error",
						data:
							previous.collectionId === collectionId && previous.load === load
								? previous.data
								: null,
						error:
							error instanceof PlanningApiError ? error.code : "INTERNAL_ERROR",
					}));
			});
		return () => {
			active = false;
		};
	}, [collectionId, enabled, load, retryVersion]);
	const retry = useCallback(
		() => setRetryVersion((version) => version + 1),
		[],
	);
	const replace = useCallback(
		(data: T | null) => {
			if (
				activeScope.current.collectionId !== collectionId ||
				activeScope.current.load !== load
			)
				return;
			requestVersion.current += 1;
			setState({ collectionId, load, phase: "ready", data, error: null });
		},
		[collectionId, load],
	);
	// Never render a previous Collection's optional data during a selection change.
	const current =
		state.collectionId === collectionId && state.load === load
			? state
			: {
					phase:
						collectionId && enabled ? ("loading" as const) : ("idle" as const),
					data: null,
					error: null,
				};
	return { ...current, retry, replace };
}
