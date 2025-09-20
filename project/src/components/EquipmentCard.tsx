type Equipment = {
  id: string;
  name: string;
  thumbnail_url: string;
  daily_rate: number;
  distance_km?: number | null;
};

export function EquipmentCard({ equipment, showDistance }: { equipment: Equipment; showDistance: boolean }) {
  return (
    <li key={equipment.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition">
      {equipment.thumbnail_url && (
        <img src={equipment.thumbnail_url} alt={equipment.name} className="h-48 w-full object-cover" />
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-800">{equipment.name}</div>
          <div className="text-sm text-emerald-600">R{Number(equipment.daily_rate).toFixed(0)}/day</div>
        </div>
        {showDistance && equipment.distance_km != null && (
          <div className="text-xs opacity-70">~{equipment.distance_km.toFixed(1)} km away</div>
        )}
        <button className="mt-2 px-3 py-2 rounded bg-blue-900 text-white">View</button>
      </div>
    </li>
  );
}
