import { useEffect, useState } from "react";

type Pos = { lat: number; lon: number } | null;

export function useGeolocation(enabled: boolean, fallback: { lat: number; lon: number }) {
	const [pos, setPos] = useState<Pos>(null);
	const [error, setError] = useState<string | null>(null);
	const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

	useEffect(() => {
		if (!enabled) { setPos(null); setError(null); setIsUsingFallback(false); return; }
		if (!("geolocation" in navigator)) {
			setPos(fallback); setIsUsingFallback(true); setError("unsupported");
			return;
		}
		let cleared = false;
		const t = setTimeout(() => {
			if (!cleared) { setPos(fallback); setIsUsingFallback(true); setError("timeout"); }
		}, 12000);
		navigator.geolocation.getCurrentPosition(
			(p) => {
				if (cleared) return;
				clearTimeout(t);
				setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
				setIsUsingFallback(false);
				setError(null);
				cleared = true;
			},
			(e) => {
				if (cleared) return;
				clearTimeout(t);
				setPos(fallback);
				setIsUsingFallback(true);
				setError(e?.message || "denied");
				cleared = true;
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
		);
		return () => { cleared = true; clearTimeout(t); };
	}, [enabled, fallback.lat, fallback.lon]);

	return { pos, error, isUsingFallback } as const;
}

