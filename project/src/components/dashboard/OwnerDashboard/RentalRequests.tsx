import { User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface RentalRequestsProps {
  bookings: any[]; // Replace 'any' with the actual booking type if available
  onSelectBooking: (booking: any) => void; // Replace 'any' with the actual booking type
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalFilteredBookings: number;
  bookingsPerPage: number;
}

const RentalRequests: React.FC<RentalRequestsProps> = ({
  bookings,
  onSelectBooking,
  selectedStatus,
  setSelectedStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  currentPage,
  setCurrentPage,
  totalFilteredBookings,
  bookingsPerPage
}) => {
  const totalPages = Math.ceil(totalFilteredBookings / bookingsPerPage);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Rental Requests</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select title='Status'
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="active">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
          className="p-2 border rounded"
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
          className="p-2 border rounded"
        />

        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setSelectedStatus('all');
          }}
          className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectBooking(booking)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-6 w-6 text-gray-400 mr-2" />
                    <span>{booking.user_profiles?.full_name || booking.user_profiles?.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{booking.equipment?.title}</div>
                  <div className="text-sm text-gray-500">{booking.equipment?.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-end pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalRequests;

