import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, ArrowLeft, ImageOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface EquipmentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  rate: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  images: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
};

// --- NEW: secure-context + robust geolocation helpers ---
const isSecureContextOk = () => {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname } = window.location;
  if (protocol === 'https:') return true;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  return false;
};

const getPositionRobust = (opts?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation API not available'));
      return;
    }
    let settled = false;
    const cleanup: Array<() => void> = [];

    navigator.geolocation.getCurrentPosition(
      (pos) => { if (!settled) { settled = true; cleanup.forEach(c => c()); resolve(pos); } },
      (err) => {
        console.warn('getCurrentPosition failed:', err);
        // let watch fallback try
      },
      { enableHighAccuracy: !!opts?.enableHighAccuracy, timeout: opts?.timeout ?? 15000, maximumAge: opts?.maximumAge ?? 0 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => { if (!settled) { settled = true; cleanup.forEach(c => c()); resolve(pos); } },
      (err) => { console.warn('watchPosition error:', err); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    cleanup.push(() => navigator.geolocation.clearWatch(watchId));

    const t = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup.forEach(c => c());
        reject(new Error('Geolocation timed out (robust)'));
      }
    }, 22000);
    cleanup.push(() => clearTimeout(t));
  });
};

const AllEquipment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AUTO location-aware (no toggle)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualBaseCity, setManualBaseCity] = useState('');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'timeout' | 'unavailable' | 'unsupported'>('idle');
  const [distancesById, setDistancesById] = useState<Record<string, number>>({});

  // Radius selector (always enabled)
  const [radiusKm, setRadiusKm] = useState<number>(150);
  // Lightweight refresh indicator for card updates only
  const [cardsLoading, setCardsLoading] = useState(false);

  useEffect(() => {
    fetchAllEquipment();
  }, []);

  const fetchAllEquipment = async (opts?: { cardsOnly?: boolean }) => {
    try {
      const useCards = !!opts?.cardsOnly;
      if (useCards) setCardsLoading(true); else setLoading(true);
      setError('');
      setDistancesById({});

      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;

      if (equipmentData) {
        const equipmentWithImages = await Promise.all(
          equipmentData.map(async (item) => {
            const { data: images, error: imagesError } = await supabase
              .from('equipment_images')
              .select('*')
              .eq('equipment_id', item.id)
              .order('is_main', { ascending: false });

            if (imagesError) {
              console.error(`Error fetching images for equipment ${item.id}:`, imagesError);
              return { ...item, id: String(item.id), images: [] } as EquipmentItem;
            }
            return { ...item, id: String(item.id), images } as EquipmentItem;
          })
        );

        setEquipment(equipmentWithImages);
      }
    } catch (err) {
      setError('Failed to fetch equipment data');
      console.error('Error fetching equipment:', err);
    } finally {
      setCardsLoading(false);
      setLoading(false);
    }
  };

  // Nearby RPC (uses user coords ONLY)
  const fetchNearbyEquipment = async (lat: number, lon: number, radius = radiusKm, opts?: { cardsOnly?: boolean }) => {
    try {
      const useCards = !!opts?.cardsOnly;
      if (useCards) setCardsLoading(true); else setLoading(true);
      setError('');

      const { data: nearby, error: rpcError } = await supabase.rpc('get_equipment_nearby', {
        user_lat: lat,
        user_lng: lon,
        max_radius_km: Math.round(radius),
        limit_count: 120,
        offset_count: 0,
      });
      if (rpcError) throw rpcError;

      const list = (nearby ?? []) as Array<{ id: string; distance_km: number }>;
      const ids = list.map((n) => n.id);
      const distanceMap: Record<string, number> = {};
      list.forEach((n) => { if (n.distance_km != null) distanceMap[String(n.id)] = Number(n.distance_km); });
      setDistancesById(distanceMap);

      if (ids.length === 0) {
        setEquipment([]);
        return;
      }

      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .in('id', ids);
      if (equipmentError) throw equipmentError;

      const details = equipmentData ?? [];
      const withImages = await Promise.all(
        details.map(async (item) => {
          const { data: images, error: imagesError } = await supabase
            .from('equipment_images')
            .select('*')
            .eq('equipment_id', item.id)
            .order('is_main', { ascending: false });
          if (imagesError) {
            console.error(`Error fetching images for equipment ${item.id}:`, imagesError);
            return { ...item, id: String(item.id), images: [] } as EquipmentItem;
          }
          return { ...item, id: String(item.id), images } as EquipmentItem;
        })
      );

      const orderIndex = new Map(ids.map((v, i) => [String(v), i]));
      withImages.sort((a, b) => (orderIndex.get(String(a.id))! - orderIndex.get(String(b.id))!));
      setEquipment(withImages);
    } catch (err) {
      console.error('Nearby fetch failed, falling back to client sort:', err);
      await fetchAllEquipment(opts);
    } finally {
      setCardsLoading(false);
      setLoading(false);
    }
  };

  const types = ['All', ...new Set(equipment.map((item) => item.type))];

  const tokens = searchTerm.split(/\s+/).filter(Boolean).map((t) => t.toLowerCase());

  // Known city coords (approximate)
  const CITY_COORDS: Record<string, { lat: number; lng: number }> = useMemo(() => ({
    'johannesburg': { lat: -26.2041, lng: 28.0473 },
    'joburg': { lat: -26.2041, lng: 28.0473 },
    'jhb': { lat: -26.2041, lng: 28.0473 },
    'pretoria': { lat: -25.7479, lng: 28.2293 },
    'rayton': { lat: -25.742, lng: 28.525 },
    'cape town': { lat: -33.9249, lng: 18.4241 },
    'capetown': { lat: -33.9249, lng: 18.4241 },
    'cpt': { lat: -33.9249, lng: 18.4241 },
    'durban': { lat: -29.8587, lng: 31.0218 },
    'port elizabeth': { lat: -33.9608, lng: 25.6022 },
    'gqeberha': { lat: -33.9608, lng: 25.6022 },
    'bloemfontein': { lat: -29.0852, lng: 26.1596 },
    'polokwane': { lat: -23.9045, lng: 29.4689 },
    'mbombela': { lat: -25.4658, lng: 30.9853 },
    'nelspruit': { lat: -25.4658, lng: 30.9853 },
    'east london': { lat: -33.0192, lng: 27.9116 },
    'kimberley': { lat: -28.7282, lng: 24.7499 },
    'pietermaritzburg': { lat: -29.6006, lng: 30.3794 },
  }), []);

  const normalizeCity = (str: string | undefined | null) => (str || '').toLowerCase().trim();
  const getCityCoords = (city: string): { lat: number; lng: number } | null => {
    const key = normalizeCity(city);
    return CITY_COORDS[key] || null;
  };

  const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (n: number) => (n * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const aVal = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  };

  // If the user typed a known city in search, use it
  const inferredCityCoords = useMemo(() => {
    for (const t of tokens) {
      const coords = getCityCoords(t);
      if (coords) return coords;
    }
    return null;
  }, [tokens]);

  // AUTO base coords: prefer real geolocation, else manual base city, else inferred city
  const baseCoords = userCoords || (manualBaseCity ? getCityCoords(manualBaseCity) : null) || inferredCityCoords;

  // Compute client-side distances when using base city (no device geolocation)
  const clientDistancesById = useMemo(() => {
    if (!baseCoords || userCoords) return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (const item of equipment) {
      const point = (item.latitude != null && item.longitude != null)
        ? { lat: Number(item.latitude), lng: Number(item.longitude) }
        : getCityCoords(item.location);
      if (!point) continue;
      map[item.id] = haversineKm(baseCoords, point);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment, baseCoords?.lat, baseCoords?.lng, !!userCoords]);

  const effectiveDistancesById = userCoords ? distancesById : clientDistancesById;

  const filteredEquipment = equipment.filter((item) => {
    const matchesType = selectedType === 'All' || item.type === selectedType;
    if (!matchesType) return false;

    // Apply radius when using base city fallback
    if (!userCoords && baseCoords) {
      const dist = effectiveDistancesById[item.id];
      if (typeof dist === 'number' && dist > radiusKm) return false;
      if (dist == null) return false; // skip items without resolvable location
    }

    if (tokens.length === 0) return true;
    const haystack = `${item.title} ${item.description} ${item.type} ${item.location} ${item.status} ${item.rate}`.toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  });

  // --- CHANGED: robust geolocation (async) ---
  const requestGeolocation = async (forceHighAcc?: boolean) => {
    if (!isSecureContextOk()) {
      console.warn('Insecure context. Use https or localhost for geolocation.');
      setGeoStatus('unsupported');
      return;
    }
    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('requesting');
    try {
      const pos = await getPositionRobust({
        enableHighAccuracy: !!forceHighAcc,
        timeout: forceHighAcc ? 20000 : 15000,
        maximumAge: forceHighAcc ? 0 : 300000
      });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      console.log('Geolocation success:', coords, 'accuracy(m):', pos.coords.accuracy);
      setUserCoords(coords);
      setGeoStatus('granted');
    } catch (err: any) {
      console.warn('Geolocation robust failed:', err?.message || err);
      try {
        const navAny = navigator as any;
        if (navAny.permissions?.query) {
          const st = await navAny.permissions.query({ name: 'geolocation' });
          if (st.state === 'denied') setGeoStatus('denied');
          else setGeoStatus('unavailable');
        } else {
          setGeoStatus('unavailable');
        }
      } catch {
        setGeoStatus('unavailable');
      }
    }
  };

  // Auto geolocation on mount
  useEffect(() => {
    requestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CHANGED: React to coords / radius changes
  // Use RPC only when we truly have device GPS; otherwise load all and filter client-side by base city/inferred city.
  useEffect(() => {
    if (userCoords) {
      fetchNearbyEquipment(userCoords.lat, userCoords.lng, radiusKm, { cardsOnly: true });
      return;
    }
    const base = manualBaseCity ? getCityCoords(manualBaseCity) : inferredCityCoords;
    if (base) {
      fetchAllEquipment({ cardsOnly: true });
      return;
    }
    fetchAllEquipment({ cardsOnly: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords?.lat, userCoords?.lng, manualBaseCity, inferredCityCoords?.lat, inferredCityCoords?.lng, radiusKm]);

  // One-shot watchPosition fallback for unavailable/timeout
  useEffect(() => {
    if (userCoords) return;
    if (!(geoStatus === 'unavailable' || geoStatus === 'timeout')) return;
    if (!('geolocation' in navigator)) return;
    let cleared = false;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (cleared) return;
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
        navigator.geolocation.clearWatch(id);
        cleared = true;
      },
      () => {
        if (!cleared) {
          navigator.geolocation.clearWatch(id);
          cleared = true;
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    const timer = setTimeout(() => {
      if (!cleared) {
        navigator.geolocation.clearWatch(id);
        cleared = true;
      }
    }, 22000);
    return () => {
      clearTimeout(timer);
      if (!cleared) navigator.geolocation.clearWatch(id);
    };
  }, [geoStatus, userCoords]);

  // Optional: permission probe to show nicer message
  useEffect(() => {
    const navAny = navigator as any;
    if (!navAny.permissions?.query) return;
    try {
      navAny.permissions.query({ name: 'geolocation' }).then((status: any) => {
        if (status.state === 'denied') setGeoStatus((s: typeof geoStatus) => (s === 'requesting' ? 'denied' : s));
      });
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-blue-900 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md-:mb-0">
              Available Equipment
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search equipment (title, type, location, status)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 w-full sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 appearance-none bg-white w-full sm:w-48"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Radius selector */}
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white w-full sm:w-36"
                title="Search radius (applies to your or base location)"
              >
                {[25, 50, 100, 150, 300, 500].map(km => (
                  <option key={km} value={km}>{km} km</option>
                ))}
              </select>

              {/* Base city shown when we don't have geolocation */}
              {!userCoords && (
                <div className="relative">
                  <select
                    value={manualBaseCity}
                    onChange={(e) => setManualBaseCity(e.target.value)}
                    className="px-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 appearance-none bg-white w-full sm:w-44"
                    title="Base city (used when device location is unavailable)"
                  >
                    <option value="">Select base city</option>
                    <option value="johannesburg">Johannesburg</option>
                    <option value="pretoria">Pretoria</option>
                    <option value="cape town">Cape Town</option>
                    <option value="durban">Durban</option>
                  </select>
                </div>
              )}

              {/* Optional: manual retry button if you want it visible
              <button onClick={() => requestGeolocation(true)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Use my location</span>
              </button>
              */}
            </div>
          </div>

          {/* Geo status helper text */}
          <div className="mb-4 text-xs text-gray-600 flex flex-wrap items-center gap-2">
            {geoStatus === 'requesting' && <span>Detecting your location…</span>}
            {geoStatus === 'granted' && <span>Using your location — nearest first.</span>}
            {geoStatus === 'denied' && <span>Location denied. Using Base city / search city if provided.</span>}
            {geoStatus === 'timeout' && <span>Location timed out. Using Base city / search city if provided.</span>}
            {geoStatus === 'unavailable' && <span>Location unavailable. Using Base city / search city if provided.</span>}
            {geoStatus === 'unsupported' && <span>Location not supported here; use HTTPS or localhost.</span>}
          </div>

          {tokens.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-gray-500 mr-1">Active filters:</span>
              {tokens.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSearchTerm(tokens.filter(x => x !== t).join(' '))}
                  className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  title="Remove filter"
                >
                  {t} <span className="ml-1">×</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-blue-700 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {cardsLoading && (
            <div className="mb-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              Updating results…
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEquipment
              .slice()
              .sort((a, b) => {
                const distA = effectiveDistancesById[a.id];
                const distB = effectiveDistancesById[b.id];
                if (distA != null && distB != null) return distA - distB;
                if (distA != null) return -1;
                if (distB != null) return 1;
                return a.title.localeCompare(b.title);
              })
              .map((item: EquipmentItem) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
                >
                  <div className="relative">
                    {(() => {
                      const mainImage = item.images?.find(img => img.is_main)?.image_url || item.images?.[0]?.image_url;
                      return mainImage ? (
                        <img
                          src={mainImage}
                          alt={item.title}
                          className="w-full h-60 object-cover"
                        />
                      ) : (
                        <div className="w-full h-60 bg-gray-100 flex items-center justify-center text-gray-500">
                          <ImageOff className="h-6 w-6 mr-2" />
                          <span>No image available</span>
                        </div>
                      );
                    })()}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {item.status}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {item.title}
                      </h3>
                      <span className="text-green-600 font-semibold">
                        R{item.rate}/day
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{item.description}</p>

                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {item.location}
                        {(effectiveDistancesById[item.id] != null) ? (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-gray-400">{Math.round(effectiveDistancesById[item.id])} km away</span>
                          </>
                        ) : baseCoords && (
                          (() => {
                            const point = (item.latitude != null && item.longitude != null)
                              ? { lat: Number(item.latitude), lng: Number(item.longitude) }
                              : getCityCoords(item.location);
                            if (!point) return null;
                            const km = Math.round(haversineKm(baseCoords, point));
                            return (
                              <>
                                <span className="mx-1">•</span>
                                <span className="text-gray-400">{km} km away</span>
                              </>
                            );
                          })()
                        )}
                      </span>
                    </div>

                    <Link
                      to={`/equipment/${item.id}`}
                      className="block w-full text-center py-3 bg-blue-900 text-white rounded-lg font-medium transition-colors duration-300 hover:bg-blue-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default AllEquipment;
