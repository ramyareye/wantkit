import { useEffect, useState } from "react";
export function useDeliveryResource<T>(
	load: () => Promise<T>,
	identity: string,
	keepPrevious = false,
) {
	const [result, setResult] = useState<{
		identity: string;
		data?: T;
		error?: string;
	}>({ identity: "" });
	useEffect(() => {
		let current = true;
		void load().then(
			(data) => {
				if (current) setResult({ identity, data });
			},
			(error: unknown) => {
				if (current)
					setResult({
						identity,
						error:
							error instanceof Error
								? error.message
								: "Could not load Delivery.",
					});
			},
		);
		return () => {
			current = false;
		};
	}, [identity, load]);
	return result.identity === identity
		? { ...result, loading: false }
		: { identity, data: keepPrevious ? result.data : undefined, loading: true };
}
