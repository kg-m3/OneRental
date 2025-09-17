import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Equipment {
    id: string;
    title: string;
    type: string;
    description: string;
    location: string;
    rate: number;
    status: string;
    created_at: string;
    updated_at: string;
    owner_id: string;
    equipment_images: {
      id?: string;
      image_url: string;
      is_main: boolean;
      equipment_id: string;
    }[];
};

type EquipmentPerf = { id: string; name: string; utilization: number; maintenanceDue?: string | null; status: 'ok' | 'maintenance' | 'idle' };

const EquipmentList = ({ equipment, onEdit, equipmentPerf }: { equipment: Equipment[]; onEdit: (equipment: Equipment) => void; equipmentPerf?: EquipmentPerf[] }) => {
  const handleToggleStatus = async (item: Equipment) => {
    const newStatus = item.status === 'available' ? 'inactive' : 'available';
    const { error } = await supabase
      .from('equipment')
      .update({ status: newStatus })
      .eq('id', item.id);

    if (!error) {
      onEdit({ ...item, status: newStatus });
    } else {
      alert('Failed to update status. Please try again.');
    }
  };

  // Build a quick lookup for performance by equipment id
  const perfMap: Record<string, EquipmentPerf> = (equipmentPerf || []).reduce((acc, p) => {
    acc[p.id] = p; return acc;
  }, {} as Record<string, EquipmentPerf>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Equipment</h2>
        <Link
          to="/list-equipment"
          className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          + Add New Equipment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => {
          const mainImage = item.equipment_images?.find((i) => i.is_main)?.image_url;
          const perf = perfMap[item.id];
          const utilizationPct = Math.round((perf?.utilization || 0) * 100);
          // Utilization color thresholds
          const utilColor = utilizationPct >= 70 ? 'bg-emerald-500' : utilizationPct >= 40 ? 'bg-amber-500' : 'bg-red-500';
          const utilTextColor = utilizationPct >= 70 ? 'text-emerald-600' : utilizationPct >= 40 ? 'text-amber-600' : 'text-red-600';
          // Status color mapping
          const statusDotColor = perf?.status === 'ok' ? 'bg-emerald-500' : perf?.status === 'idle' ? 'bg-amber-500' : 'bg-red-500';
          const statusPillClass = perf?.status === 'ok'
            ? 'bg-emerald-50 text-emerald-700'
            : perf?.status === 'idle'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-red-50 text-red-700';

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img
                src={mainImage || '/default-equipment.jpg'}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col h-full">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{item.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'inactive'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{item.type}</p>
                  <p className="text-green-600 font-semibold text-lg">R{item.rate}/day</p>

                  {/* Actions placed prominently under pricing */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="px-3 py-1.5 text-sm bg-blue-900 text-white rounded-md hover:bg-blue-800"
                    >
                      View Equipment
                    </button>
                  </div>

                  {/* Performance block */}
                  {perf && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Utilization</span>
                        <span className={`font-medium ${utilTextColor}`}>{utilizationPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${utilColor}`} style={{ width: `${utilizationPct}%` }} />
                      </div>
                      {/* <div className="flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusPillClass}`}>
                          <span className={`inline-block w-2 h-2 rounded-full ${statusDotColor}`} />
                          {perf.status === 'ok' ? 'Healthy' : perf.status === 'idle' ? 'Idle' : 'Needs Maintenance'}
                        </span>
                        {perf.maintenanceDue && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                            Maintenance due
                          </span>
                        )}
                      </div> */}
                    </div>
                  )}
                </div>
                {/* Bottom actions removed to avoid duplication; top actions are primary */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentList;
