import { Package, Calendar } from 'lucide-react';
import CountUp from 'react-countup';
interface StatsProps {
  stats: {
    totalEquipment?: number;
    activeBookings?: number;
    totalBookings?: number;
  };
  onEquipmentClick?: () => void;
  onActiveBookingsClick?: () => void;
  onTotalBookingsClick?: () => void;
}

const StatsOverview = ({ stats, onEquipmentClick, onActiveBookingsClick, onTotalBookingsClick }: StatsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6 mb-8">
    <button type="button" onClick={onEquipmentClick} className="text-left bg-white p-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total Equipment</p>
          <h3 className="text-2xl font-bold"><CountUp end={stats.totalEquipment || 0 } duration={1.5}/></h3>
        </div>
        <Package className="h-8 w-8 text-blue-900" />
      </div>
    </button>

    <button type="button" onClick={onActiveBookingsClick} className="text-left bg-white p-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Active Bookings</p>
          <h3 className="text-2xl font-bold"><CountUp end={stats.activeBookings || 0 }  duration={1.5}/></h3>
        </div>
        <Calendar className="h-8 w-8 text-blue-900" />
      </div>
    </button>

    <button type="button" onClick={onTotalBookingsClick} className="text-left bg-white p-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total Bookings</p>
          <h3 className="text-2xl font-bold"><CountUp end={stats.totalBookings || 0 } duration={1.5}/></h3>
        </div>
        <Calendar className="h-8 w-8 text-blue-900" />
      </div>
    </button>
  </div>
);

export default StatsOverview;
