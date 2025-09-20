import { useEffect, useState } from "react";

const STORAGE_KEY = "onerental.locationAwareEnabled";

export function useLocationAwarePref(defaultEnabled: boolean = true) {
	const [enabled, setEnabled] = useState<boolean>(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw == null ? defaultEnabled : raw === "true";
		} catch {
			return defaultEnabled;
		}
	});

	useEffect(() => {
		try { localStorage.setItem(STORAGE_KEY, String(enabled)); } catch {}
	}, [enabled]);

	return { enabled, setEnabled } as const;
}

