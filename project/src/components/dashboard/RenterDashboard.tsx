import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  Search,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  XCircle,
  AlertTriangle,
  HandCoins,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useMockDataStore } from '../../store/mockDataStore';
import axios from 'axios';

interface Booking {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active';
  notes: string;
  created_at: string;
  total_amount: number;
  equipment: {
    title: string;
    location: string;
    images: Array<{
      image_url: string;
      is_main: boolean;
    }>;
  };
};

const RenterDashboard = () => {
  // const { bookings } = useMockDataStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleFNBPayment = async (booking: Booking) => {
    try {
      const response = await axios.post('/api/fnb-payment', {
        bookingId: booking.id,
        amount: booking.total_amount,
        userId: booking.renter_id,
        equipmentId: booking.equipment_id
      });
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      setError('Payment processing failed. Please try again.');
      setPaymentStatus('failed');
    }
  };

  useEffect(() => {
    fetchBookings();

  }, []);
  useEffect(() => {

    setStats({
      activeBookings: bookings.filter(b => b.status === 'active').length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
    });
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          equipment!inner (
            *,
            equipment_images!inner (image_url, is_main)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Bookings data:', data);
      
      // Ensure we have the correct data structure
      const processedBookings = data?.map(booking => ({
        ...booking,
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

  
  const BookingDetailsModal = ({ booking, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24">
              <img
                src={booking.equipment?.images?.find((img: { image_url: string; is_main: boolean }) => img.is_main)?.image_url || '/public/default-equipment.jpg'}
                alt={booking.equipment?.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{booking.equipment?.title}</h3>
              <p className="text-gray-600">{booking.equipment?.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Equipment Information</h3>
              <div className="space-y-3">
                <p><strong>Equipment:</strong> {booking.equipment.title}</p>
                <p><strong>Type:</strong> {booking.equipment.type}</p>
                <p><strong>Location:</strong> {booking.equipment.location}</p>
                <p><strong>Daily Rate:</strong> R{booking.equipment.rate}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span>
                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Total Amount: R{booking.total_amount}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Status: <span className={`px-2 py-1 rounded-full text-sm ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{booking.status}</span></span>
                </div>
              </div>
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />
                  Your booking is pending approval. You will be notified once the owner approves or rejects your request.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
                  onClick={async () => {
                    try {
                      console.log(booking.id);
                      const { error } = await supabase
                        .from('bookings')
                        .delete()
                        .eq('id', booking.id);

                      if (error) throw error;

                      // Update local state
                      setBookings(prev => prev.filter(b => b.id !== booking.id));
                      
                      // Close modal
                      onClose();
                      
                      // Show success message
                      alert('Booking cancelled successfully');
                    } catch (error) {
                      console.error('Error cancelling booking:', error);
                      alert('Failed to cancel booking. Please try again.');
                    }
                  }}
                >
                  Cancel Booking
                </button>
                <Link
                  to={`/equipment/${booking.equipment_id}`}
                  className="px-3 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Equipment
                </Link>
              </div>
            </div>
          )}

          {booking.status === 'active' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Your booking has been accepted! Please proceed with the payment to secure your rental.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
                  onClick={() => handleFNBPayment(booking)}
                >
                  Complete Payment
                </button>
                <Link
                  to={`/equipment/${booking.equipment_id}`}
                  className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Equipment
                </Link>
              </div>
            </div>
          )}

          {booking.status === 'rejected' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-800">
                  <XCircle className="h-5 w-5 inline mr-2" />
                  Your booking has been rejected. {booking.notes}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/equipment/${booking.equipment_id}`}
                  className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Equipment
                </Link>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );

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
        <h2 className="text-xl font-bold mb-6">Your Bookings</h2>
        <div className="space-y-4">

          {/* Bookings Content */}
          {isLoading && bookings.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              </div>
            </div>
          )}

          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg cursor-pointer transition-colors relative"
              onClick={() => setSelectedBooking(booking)}
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
          ))}
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