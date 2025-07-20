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

const EquipmentList = ({ equipment, onEdit }: { equipment: Equipment[]; onEdit: (equipment: Equipment) => void }) => {
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
              <div className="p-4 flex flex-col justify-between h-full">
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
                </div>
                <div className="mt-2 flex flex-col justify-betwee gap-2">
                    <button
                    onClick={() => onEdit(item)}
                    className="w-full px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                    View e
                    </button>
                    <button
                    type="button"
                        onClick={() => {
                        const confirm = window.confirm(
                            `Mark equipment as ${item.status === 'available' ? 'inactive' : 'available'}?`
                        );
                        if (confirm) handleToggleStatus(item);
                        }}
                        className="w-full px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        {item.status === 'available' ? 'Mark Inactive' : 'Mark Active'}
                    </button>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => onEdit(item)}
                    className="w-full px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      const confirm = window.confirm(
                        `Mark equipment as ${item.status === 'available' ? 'inactive' : 'available'}?`
                      );
                      if (confirm) handleToggleStatus(item);
                    }}
                    className="w-full px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {item.status === 'available' ? 'Mark Inactive' : 'Mark Active'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentList;
