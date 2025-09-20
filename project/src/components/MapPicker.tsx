import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

type LatLng = { lat: number; lng: number };
type MapPickerProps = {
  value?: LatLng | null;
  onChange: (v: { lat: number; lng: number; label?: string }) => void;
  initialCenter?: LatLng; // default JHB
  initialZoom?: number;   // default 10
  country?: string;       // 'ZA'
  className?: string;
  height?: number;        // px
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapPicker({
  value,
  onChange,
  initialCenter = { lat: -26.2041, lng: 28.0473 },
  initialZoom = 10,
  country = 'ZA',
  className,
  height = 320,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: value ? [value.lng, value.lat] : [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl,
      marker: false, // we manage our own to make it draggable
      placeholder: 'Search suburb, city…',
      countries: country,
    });
    map.addControl(geocoder, 'top-left');

    const startLngLat = value
      ? [value.lng, value.lat] as [number, number]
      : [initialCenter.lng, initialCenter.lat] as [number, number];

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(startLngLat)
      .addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLngLat();
      onChange({ lat, lng });
    });

    geocoder.on('result', (e: any) => {
      const [lng, lat] = e.result.center;
      marker.setLngLat([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 14 });
      onChange({ lat, lng, label: e.result.place_name });
    });

    return () => {
      geocoder.off('result', () => {});
      map.remove();
    };
  }, []);

  // Keep marker in sync if parent updates value
  useEffect(() => {
    if (!value || !markerRef.current) return;
    markerRef.current.setLngLat([value.lng, value.lat]);
  }, [value?.lat, value?.lng]);

  return <div className={className} style={{ height }} ref={mapContainerRef} />;
}
