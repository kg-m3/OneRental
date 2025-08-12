import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  Search,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/authContext';
import BookingDetailsModal from './BookingDetailsModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface Booking {
  id: string;
  equipment_id: string;
  renter_id: string;
  renter_email: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active';
  payment_state?: 'pending' | 'paid' | 'failed' | 'refunded' | 'unpaid';
  payment_date?: string; 
  notes: string;
  created_at: string;
  total_amount: number;
  equipment: {
    title: string;
    location: string;
    type: string;
    rate: number;
    images: Array<{
      image_url: string;
      is_main: boolean;
    }>;
  };
};

const RenterDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  console.log('RenterDashboard rendering...');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Debug effect to track selectedBooking changes
  useEffect(() => {
    console.log('selectedBooking updated:', selectedBooking);
  }, [selectedBooking]);
  
  const handleBookingClick = (booking: Booking) => {
    console.log('Booking clicked:', booking);
    setSelectedBooking(booking);
  };
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');


  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter(booking => {
      // Status filter
      if (selectedStatus !== 'all' && booking.status !== selectedStatus) {
        return false;
      }

      // Date range filter
      const bookingStartDate = new Date(booking.start_date);
      const bookingEndDate = new Date(booking.end_date);

      if (startDate && bookingEndDate < startDate) {
        return false;
      }
      if (endDate && bookingStartDate > endDate) {
        return false;
      }

      return true;
    });

    setFilteredBookings(filtered);
    
    // Update stats based on filtered results
    setStats({
      activeBookings: filtered.filter(b => b.status === 'active').length,
      totalBookings: filtered.length,
      pendingBookings: filtered.filter(b => b.status === 'pending').length,
    });
  }, [bookings, selectedStatus, startDate, endDate]);

  const fetchBookings = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:user_profiles!fk_bookings_user_profiles (user_id, full_name, email, phone),
        equipment:equipment!bookings_equipment_id_fkey (
          id, title, type, rate,
          equipment_images (id, image_url, is_main)
        )
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Bookings data:', data);
      
      // Ensure we have the correct data structure
      const processedBookings = data?.map(booking => ({
        ...booking,
        renter_email: booking.user?.email || '',
        equipment: {
          ...booking.equipment,
          images: booking.equipment?.equipment_images || []
        }
      })) || [];

      setBookings(processedBookings);
    } catch (err) {
      setError('Failed to fetch equipment data');
      console.error('Error fetching equipment:', err);
    } finally {
      console.log("setting loading to false");
      setLoading(false);
    }
  };

  
  // const BookingDetailsModal = ({ booking, onClose }: { booking: any; onClose: () => void }) => (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
  //     <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[90vh] flex flex-col">
  //       <div className="flex justify-between items-center p-6 border-b">
  //         <h2 className="text-xl font-bold">Booking Details</h2>
  //         <button title='Close' type='button' onClick={onClose} className="text-gray-500 hover:text-gray-700">
  //           <XCircle className="h-6 w-6" />
  //         </button>
  //       </div>
  //       <div className="flex-1 overflow-y-auto p-6">
  //         <div className="flex items-center gap-4 mb-4">
  //           <div className="w-24 h-24">
  //             <img
  //               src={booking.equipment?.images?.find((img: { image_url: string; is_main: boolean }) => img.is_main)?.image_url || '/public/default-equipment.jpg'}
  //               alt={booking.equipment?.title}
  //               className="w-full h-full object-cover rounded-lg"
  //             />
  //           </div>
  //           <div>
  //             <h3 className="text-lg font-semibold">{booking.equipment?.title}</h3>
  //             <p className="text-gray-600">{booking.equipment?.location}</p>
  //           </div>
  //         </div>

  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //           <div>
  //             <h3 className="font-semibold text-lg mb-4">Equipment Information</h3>
  //             <div className="space-y-3">
  //               <p><strong>Equipment:</strong> {booking.equipment.title}</p>
  //               <p><strong>Type:</strong> {booking.equipment.type}</p>
  //               <p><strong>Location:</strong> {booking.equipment.location}</p>
  //               <p><strong>Daily Rate:</strong> R{booking.equipment.rate}</p>
  //             </div>
  //           </div>
  //           <div>
  //             <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
  //             <div className="space-y-3">
  //             <p><strong>Rental Period:</strong> {booking.days} days</p>
  //             <p><strong>Total Amount:</strong> R{booking.total_amount}</p>
  //             <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${
  //                     booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
  //                     booking.status === 'active' ? 'bg-green-100 text-green-800' :
  //                     booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
  //                     'bg-gray-100 text-gray-800'
  //                   }`}>{booking.status}</span></p>
  //               <p><strong>Booking Date:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>

  //               {booking.notes && (
  //                 <div className="pt-2 border-t mt-3">
  //                   <div className="text-sm font-medium text-gray-500 mb-1">Your Notes</div>
  //                   <div className="text-sm bg-gray-50 p-3 rounded-md">
  //                     {booking.notes}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>

  //         {booking.status === 'pending' && (
  //           <div className="mt-6 space-y-4">
  //             <div className="p-4 bg-yellow-50 rounded-lg">
  //               <p className="text-yellow-800">
  //                 <AlertTriangle className="h-5 w-5 inline mr-2" />
  //                 Your booking is pending approval. You will be notified once the owner approves or rejects your request.
  //               </p>
  //             </div>
  //             <div className="flex space-x-2">
  //               <button
  //                 className="px-3 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
  //                 onClick={async () => {
  //                   try {
  //                     console.log(booking.id);
  //                     const { error } = await supabase
  //                       .from('bookings')
  //                       .delete()
  //                       .eq('id', booking.id);

  //                     if (error) throw error;

  //                     // Update local state
  //                     setBookings(prev => prev.filter(b => b.id !== booking.id));
                      
  //                     // Close modal
  //                     onClose();
                      
  //                     // Show success message
  //                     alert('Booking cancelled successfully');
  //                   } catch (error) {
  //                     console.error('Error cancelling booking:', error);
  //                     alert('Failed to cancel booking. Please try again.');
  //                   }
  //                 }}
  //               >
  //                 Cancel Booking
  //               </button>
  //               <Link
  //                 to={`/equipment/${booking.equipment_id}`}
  //                 className="px-3 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
  //                 onClick={(e) => e.stopPropagation()}
  //               >
  //                 View Equipment
  //               </Link>
  //             </div>
  //           </div>
  //         )}

  //         {booking.status === 'active' && (
  //           <div className="mt-6 space-y-4">
  //             <div className="p-4 bg-green-50 rounded-lg">
  //               <p className="text-green-800">
  //                 <CheckCircle className="h-5 w-5 inline mr-2" />
  //                 Your booking has been accepted! Please proceed with the payment to secure your rental.
  //               </p>
  //             </div>
  //             <div className="flex space-x-2">
  //               <button
  //                 className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
  //                 onClick={() => handleFNBPayment(booking)}
  //               >
  //                 Complete Payment
  //               </button>
  //               <Link
  //                 to={`/equipment/${booking.equipment_id}`}
  //                 className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
  //                 onClick={(e) => e.stopPropagation()}
  //               >
  //                 View Equipment
  //               </Link>
  //             </div>
  //           </div>
  //         )}

  //         {booking.status === 'rejected' && (
  //           <div className="mt-6 space-y-4">
  //             <div className="p-4 bg-red-50 rounded-lg">
  //               <p className="text-red-800">
  //                 <XCircle className="h-5 w-5 inline mr-2" />
  //                 Your booking has been rejected. {booking.notes}
  //               </p>
  //             </div>
  //             <div className="flex space-x-2">
  //               <Link
  //                 to={`/equipment/${booking.equipment_id}`}
  //                 className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
  //                 onClick={(e) => e.stopPropagation()}
  //               >
  //                 View Equipment
  //               </Link>
  //             </div>
  //           </div>
  //         )}
          
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Rentals</p>
              <h3 className="text-2xl font-bold">{stats.activeBookings}</h3>
            </div>
            <Calendar className="h-8 w-8 text-blue-900" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending Requests</p>
              <h3 className="text-2xl font-bold">{stats.pendingBookings}</h3>
            </div>
            <Clock className="h-8 w-8 text-blue-900" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-900" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            to="/all-equipment"
            className="flex-1 bg-blue-900 text-white rounded-lg p-4 flex items-center justify-center hover:bg-blue-800 transition-colors"
          >
            <Search className="h-5 w-5 mr-2" />
            Browse Equipment
          </Link>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Bookings</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              title="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 border rounded text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
            </select>

            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              className="p-2 border rounded text-sm w-36"
              dateFormat="yyyy-MM-dd"
              isClearable
            />

            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              className="p-2 border rounded text-sm w-36"
              dateFormat="yyyy-MM-dd"
              isClearable
            />

            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setSelectedStatus('all');
              }}
              className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="space-y-4">

          {/* Bookings Content */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bookings found matching your filters.
            </div>
          ) : (
            filteredBookings.map((booking) => {
              console.log('Rendering booking:', booking.id, 'status:', booking.status, 'payment_state:', booking.payment_state);
              return (
                <div
                  key={booking.id}
                  className="border rounded-lg cursor-pointer transition-colors relative"
                  onClick={() => handleBookingClick(booking)}
                >
                  {/* Image Container */}
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden md:absolute md:left-0 md:top-0 md:w-48 md:h-full">
                    <img 
                      src={booking.equipment?.images?.find((img: { image_url: string; is_main: boolean }) => img.is_main)?.image_url || '/public/default-equipment.jpg'}
                      alt={booking.equipment?.title || 'Equipment'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  {/* Content Container */}
                  <div className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                      <div className="w-full md:w-48 md:h-full" />
                      
                      {/* Booking Details */}
                      <div className="flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.equipment?.title}</h3>
                          <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{booking.equipment?.location}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-semibold">
                                Total: R{booking.total_amount}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : booking.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default RenterDashboard;