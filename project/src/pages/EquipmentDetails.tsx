import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, PenTool as Tool, HandCoins, Shield, ArrowLeft, X, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDrag } from '@use-gesture/react';

interface Equipment {
  id: string;
  title: string;
  description: string;
  rate: number;
  location: string;
  user_profiles?: {
    id: string;
    company_name: string;
    full_name: string;
    email: string;
  };
  status: string;
  images: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
  // features: string[];
  // Add other equipment properties as needed
};

interface BookingData {
  startDate: string;
  endDate: string;
  notes: string;
}

interface BookingRequest {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes: string;
  created_at: string;
}

const EquipmentDetails = () => {
  const { id } = useParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [user, setUser] = useState<any>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [duration, setDuration] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Mock image data for testing
  const mockImages = [
    'https://images.unsplash.com/photo-1646297970360-94c9f6d8903c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1630288214032-2c4cc2c080ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnVsbGRvemVyfGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1610477865545-37711c53144d?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ];
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Swipe gesture handler
  const bind = useDrag(({ active, movement: [mx], offset: [ox] }) => {
    setDragging(active);
    setDragOffset(ox);

    if (!active && Math.abs(ox) > 50) { // Swipe threshold
       const newIndex = ox > 0 
         ? (currentImageIndex - 1 + (equipment?.images?.length || 0)) % (equipment?.images?.length || 0)
         : (currentImageIndex + 1) % (equipment?.images?.length || 0);
      setCurrentImageIndex(newIndex);
    }
  });

  useEffect(() => {
     // Get current user
   const checkAuth = async () => {
    try {
      setAuthState('checking');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        if (authError instanceof Error && authError.name === 'AuthSessionMissingError') {
          console.log('No active session found');
          setAuthState('unauthenticated');
          return;
        }
        throw authError;
      }

      if (!user) {
        console.log('User not authenticated');
        setAuthState('unauthenticated');
      } else {
        console.log('User authenticated');
        console.log(user);
        setUser(user);
        setAuthState('authenticated');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthState('unauthenticated');
    } finally {
      // Add finally block to ensure proper cleanup
    }
  };

    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const { data: equipment, error: equipmentError } = await supabase
          .from('equipment')
          .select('*,user_profiles!inner (id, company_name, full_name, email)')
          .eq('id', id)
          .single();

        if (equipmentError) throw equipmentError;

        // Fetch images for this equipment
        const { data: images, error: imagesError } = await supabase
          .from('equipment_images')
          .select('*')
          .eq('equipment_id', equipment.id)
          .order('is_main', { ascending: false });

        if (imagesError) {
          console.error('Error fetching images:', imagesError);
          setImages([]);
        } else {
          setImages(images);
        }

        setEquipment({ ...equipment, images });
      } catch (err) {
        setError('Failed to fetch equipment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchEquipmentDetails();

    if (equipment?.rate && duration > 0) {
      setTotalAmount(equipment.rate * duration);
    }
  }, [id, duration, equipment?.rate]);


  const calculateDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        const newBookingData = { ...bookingData, [field]: value };
        setBookingData(newBookingData);
    
        if (newBookingData.startDate && newBookingData.endDate) {
          const days = calculateDuration(
            newBookingData.startDate,
            newBookingData.endDate
          );
          setDuration(days);
          if (equipment) {
            setTotalAmount(days * equipment.rate);
          } else {
            setTotalAmount(0);
          }
        }
      };

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!equipment?.id) {
      setError('Equipment not found');
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {


      // Calculate total amount
      const days = calculateDuration(bookingData.startDate, bookingData.endDate);
      if (days <= 0) {
        setError('End date must be after start date');
        return;
      }

      const total = days * equipment.rate;
      console.log(equipment);
      console.log(bookingData);
      console.log( user);
      // Insert booking request
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            equipment_id: equipment.id,
            user_id: user?.id,
            start_date: bookingData.startDate,
            end_date: bookingData.endDate,
            // notes: bookingData.notes || '',
            status: 'pending',
            total_amount: total
          }
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Show success message
      setError('Booking request sent successfully! The owner will contact you shortly.');
      setShowBookingModal(false);
      setBookingData({
        startDate: '',
        endDate: '',
        notes: ''
      });
      setError('');
    } catch (err: any) {
      console.error('Error booking:', err);
      setError(err.message || 'Failed to send booking request. Please try again.');
    }
  };

  // const handleImageChange = (index: number) => {
  //   setCurrentImageIndex(index);
  // };
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link to="/equipment" className="inline-flex items-center text-gray-600 hover:text-yellow-600 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Equipment
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative" {...bind()}>
                <img
                  src={equipment?.images?.[currentImageIndex]?.image_url || ''}
                  alt={equipment?.title}
                  className="w-full h-[400px] object-cover transition-transform duration-300"
                  style={{
                    transform: `translateX(${dragging ? dragOffset : 0}px)`
                  }}
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {equipment?.images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-yellow-600' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Features & Specifications</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipment.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Tool className="h-5 w-5 text-yellow-600 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{equipment?.title}</h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {equipment?.status}
                </span>
              </div>

              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">{equipment?.location}</span>
              </div>

              <p className="text-gray-600 mb-6">{equipment?.description}</p>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center">
                  <HandCoins className="h-6 w-6 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">R{equipment?.rate}</p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                   
                    if (authState === 'unauthenticated') {
                      setShowLoginModal(true);
                    } else {
                      setShowLoginModal(false);
                      setShowBookingModal(true);
                    }
                  }}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Book Now
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold mb-4">Equipment Provider</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{equipment?.user_profiles?.company_name}</p>
                    {/* <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{equipment.owner.rating}</span>
                    </div> */}
                  </div>
                  {/* <button className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
                    Contact
                  </button> */}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold">Rental Protection</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-600 rounded-full mr-2"></span>
                  Verified equipment provider
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-600 rounded-full mr-2"></span>
                  Secure payments through our platform
                </li>
                {/* <li className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-600 rounded-full mr-2"></span>
                  24/7 customer support
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-32 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Please Login</h2>
              <button
                onClick={() => setShowLoginModal(false)} // Reset to loading state
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-center">
                You need to be logged in to book equipment. Please login or create an account.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    window.location.href = '/auth';
                  }}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Login
                </button>
                {/* <button
                  onClick={() => {
                    setAuthState('loading'); // Reset to loading state
                    window.location.href = '/auth';
                  }}
                  className="px-6 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
                >
                  Create Account
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-32 z-50 ">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Book Equipment</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.startDate}
                  onChange={(e) => {
                    handleDateChange('startDate', e.target.value)
                    setBookingData({ ...bookingData, startDate: e.target.value })}}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.endDate}
                  onChange={(e) => {
                    handleDateChange('endDate', e.target.value)
                    setBookingData({ ...bookingData, endDate: e.target.value })}}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={4}
                  placeholder="Any special requirements or questions?"
                />
              </div>

              {duration > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      <Clock className="inline-block h-4 w-4 mr-1" />
                      Duration:
                    </span>
                    <span className="font-medium">{duration} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">R{totalAmount}</span>
                  </div>
                </div>
              )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-yellow-800 font-medium">Important Note</h4>
                  <p className="text-yellow-600 text-sm mt-1">
                    This is a booking request. The equipment owner will review and
                    confirm your booking.
                  </p>
                </div>
              </div>
            </div>

              <div className="flex justify-end pt-4 px-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Submit Booking Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;