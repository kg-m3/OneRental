import { User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface RentalRequestsProps {
  bookings: any[]; // Replace 'any' with the actual booking type if available
  onSelectBooking: (booking: any) => void; // Replace 'any' with the actual booking type
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalFilteredBookings: number;
  bookingsPerPage: number;
  approveBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  rejectBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

const RentalRequests: React.FC<RentalRequestsProps> = ({
  bookings,
  onSelectBooking,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
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
  const tokens = searchQuery.split(/\s+/).filter(Boolean);
  const removeToken = (tok: string) => {
    const next = tokens.filter(t => t !== tok).join(' ');
    setSearchQuery(next);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Rental Requests</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search renter, email, equipment, status..."
            className="p-2 pr-10 border rounded w-72"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            list="locations"
            placeholder="Filter by location"
            className="p-2 border rounded w-56"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) {
                  const token = val.toLowerCase();
                  const current = searchQuery.toLowerCase();
                  if (!current.includes(token)) setSearchQuery(searchQuery ? `${searchQuery} ${token}` : token);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <datalist id="locations">
            {/* Optional quick picks; can be populated dynamically later */}
            <option value="johannesburg" />
            <option value="pretoria" />
            <option value="cape town" />
            <option value="durban" />
          </datalist>
        </div>
        <select title='Status'
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="active">Active</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
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
            setSearchQuery('');
          }}
          className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>

      {tokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">Active filters:</span>
          {tokens.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => removeToken(t)}
              className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              title="Remove filter"
            >
              {t} <span className="ml-1">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-blue-700 hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => {
              // Define ordered lifecycle milestones
              const lifecycle: { key: string; label: string }[] = [
                { key: 'pending', label: 'Pending' },
                { key: 'accepted', label: 'Accepted' },
                { key: 'active', label: 'Active' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'returned', label: 'Returned' },
                { key: 'completed', label: 'Completed' }
              ];
              // Terminal negative states we show separately
              const negative = ['rejected','cancelled'];
              const currentIndex = lifecycle.findIndex(m => m.key === booking.status || (booking.status === 'paid' && m.key === 'completed') || (booking.status === 'active' && m.key === 'active'));
              const isNegative = negative.includes(booking.status);
              return (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 cursor-pointer align-top"
                onClick={() => onSelectBooking(booking)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-6 w-6 text-gray-400 mr-2" />
                    <span>{booking.user?.full_name || booking.user?.email}</span>
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
                    booking.status === 'accepted' || booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'delivered' ? 'bg-sky-100 text-sky-800' :
                    booking.status === 'returned' ? 'bg-teal-100 text-teal-800' :
                    booking.status === 'completed' || booking.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                    booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                  {/* Progress timeline matching provided design */}
                  <div className="mt-3 w-[430px] select-none">
                    {isNegative ? (
                      <div className="flex items-center gap-2 text-red-600 text-[11px]">
                        <span className="font-semibold">×</span>
                        <span className="truncate">{booking.status === 'rejected' ? 'Request Rejected' : 'Booking Cancelled'}</span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[11px] font-medium text-gray-600 mb-1">Progress</div>
                        <div className="relative pt-0.5" aria-label="Rental status progression">
                          {/* Base track (offset so it begins/ends at dot centers) */}
                          <div className="absolute top-2.5 left-4 right-6 h-[2px] bg-gray-200 rounded" />
                          {/* Progress track */}
                          {currentIndex > -1 && (
                            <div
                              className="absolute top-2.5 left-4 h-[2px] bg-blue-900 rounded transition-all duration-300"
                              style={{ width: `calc(${(currentIndex / (lifecycle.length - 1)) * 100}% - 0.25rem)` }}
                            />
                          )}
                          <ol className="flex justify-between relative z-10">
                            {lifecycle.map((m, idx) => {
                              const reached = currentIndex >= idx && currentIndex !== -1;
                              const future = currentIndex < idx || currentIndex === -1;
                              return (
                                <li key={m.key} className="flex flex-col items-center text-center" aria-current={reached && currentIndex === idx ? 'step' : undefined}>
                                  <div
                                    className={`h-4 w-4 rounded-full border ${reached ? 'bg-blue-900 border-blue-900' : 'bg-white border-gray-300'} transition-colors`}
                                    title={m.label}
                                  />
                                  <span className={`mt-2 text-[11px] leading-tight ${future ? 'text-gray-400' : 'text-gray-700'} ${reached && currentIndex === idx ? 'font-semibold' : ''}`}>
                                    {m.label}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.risk ? (
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                      booking.risk.level === 'high' ? 'bg-red-100 text-red-700' :
                      booking.risk.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {booking.risk.level.toUpperCase()} • {booking.risk.score}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </td>
              </tr>
            )})}
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

