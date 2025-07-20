import { Package, Calendar } from 'lucide-react';
import CountUp from 'react-countup';
interface StatsProps {
    stats: {
      totalEquipment?: number;
      activeBookings?: number;
    //   pendingApprovals?: number;
      totalBookings?: number;
      
    };
  }

const StatsOverview = ({ stats }: StatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total Equipment</p>
          <h3 className="text-2xl font-bold"><CountUp end={stats.totalEquipment || 0 } duration={1.5}/></h3>
        </div>
        <Package className="h-8 w-8 text-blue-900" />
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Active Bookings</p>
          <h3 className="text-2xl font-bold"><CountUp end={stats.activeBookings || 0 }  duration={1.5}/></h3>
        </div>
        <Calendar className="h-8 w-8 text-blue-900" />
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Total Bookings</p>
          <h3 className="text-2xl font-bold"><CountUp end={stats.totalBookings || 0 } duration={1.5}/></h3>
        </div>
        <Calendar className="h-8 w-8 text-blue-900" />
      </div>
    </div>
  </div>
);

export default StatsOverview;
