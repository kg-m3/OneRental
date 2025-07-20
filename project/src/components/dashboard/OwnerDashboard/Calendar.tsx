import { Calendar as CalendarIcon } from 'lucide-react';

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
}

const Calendar = ({ equipment }: { equipment: Equipment[] }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Calendar View</h2>
      <div className="flex space-x-2">
        <select title="Select an option"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Equipment</option>
          {equipment.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
      <CalendarIcon className="h-16 w-16 mx-auto mb-4" />
      <p>Calendar view coming soon...</p>
    </div>
  </div>
);

export default Calendar;
