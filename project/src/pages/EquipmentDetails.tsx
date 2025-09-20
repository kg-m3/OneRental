import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, HandCoins, Shield, ArrowLeft, X, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/slider.css';


interface Equipment {
  id: string;
  title: string;
  description: string;
  rate: number;
  location: string;
  owner_id?: string;
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
};

interface BookingData {
  startDate: string;
  endDate: string;
  notes: string;
}

const EquipmentDetails = () => {
  const navigate = useNavigate();
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
  const FEATURE_SUGGESTIONS = (import.meta.env.VITE_FEATURE_SUGGESTIONS || 'off').toLowerCase() === 'on';
  const variant = useMemo(() => (Math.random() < 0.5 ? 'A' : 'B'), []);

  // Images from equipment object
  const imagesToShow = equipment?.images?.map(img => img.image_url) || [];

  // Custom arrow components for far-end positioning
  const Arrow = ({ style, onClick, direction }: any) => (
    <button
      type="button"
      className={`absolute top-1/2 z-20 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 flex items-center justify-center transition-all duration-200
        ${direction === 'left' ? 'left-2' : 'right-2'}
        group focus:outline-none focus:ring-2 focus:ring-blue-900`
      }
      style={{ ...style, width: 40, height: 40 }}
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous image' : 'Next image'}
    >
      {direction === 'left' ? <ChevronLeft className="w-6 h-6 text-blue-900 group-hover:text-blue-700" /> : <ChevronRight className="w-6 h-6 text-blue-900 group-hover:text-blue-700" />}
    </button>
  );

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
  beforeChange: (_current: number, next: number) => setCurrentImageIndex(next),
    dotsClass: 'slick-dots',
    customPaging: (i: number) => (
      <button
        type="button"
        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
          i === currentImageIndex ? 'bg-blue-900' : 'bg-gray-300'
        }`}
        aria-label={`Go to slide ${i + 1}`}
        tabIndex={i === currentImageIndex ? 0 : -1}
      />
    ),
    arrows: true,
    draggable: true,
    swipe: true,
    touchMove: true,
    accessibility: true,
    focusOnSelect: true,
    nextArrow: <Arrow direction="right" />,
    prevArrow: <Arrow direction="left" />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1, dots: true, dotsClass: 'slick-dots' } },
      { breakpoint: 600,  settings: { slidesToShow: 1, slidesToScroll: 1, dots: true, dotsClass: 'slick-dots' } },
      { breakpoint: 480,  settings: { slidesToShow: 1, slidesToScroll: 1, dots: true, dotsClass: 'slick-dots' } }
    ]
  };

  useEffect(() => {
    // Auth check
    const checkAuth = async () => {
      try {
        setAuthState('checking');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setAuthState('unauthenticated');
          return;
        }
        if (!user) {
          setAuthState('unauthenticated');
        } else {
          setUser(user);
          setAuthState('authenticated');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuthState('unauthenticated');
      }
    };

    // Fetch equipment
    const fetchEquipmentDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const { data: equipmentRow, error: equipmentError } = await supabase
          .from('equipment')
          .select('*,user_profiles!inner (id, company_name, full_name, email)')
          .eq('id', id)
          .single();

        if (equipmentError) throw equipmentError;

        // Fetch images for this equipment
        const { data: imageRows, error: imagesError } = await supabase
          .from('equipment_images')
          .select('*')
          .eq('equipment_id', equipmentRow.id)
          .order('is_main', { ascending: false });

        if (imagesError) {
          console.error('Error fetching images:', imagesError);
        }

        setEquipment({ ...equipmentRow, images: imageRows || [] });
        setCurrentImageIndex(0);
      } catch (err) {
        setError('Failed to fetch equipment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    if (id) fetchEquipmentDetails();
  }, [id]);

  // Recompute totals when duration or rate changes (with a simple 5% service fee)
  useEffect(() => {
    if (duration > 0 && equipment?.rate) {
      const subtotal = duration * equipment.rate;
      const serviceFee = Math.round(subtotal * 0.05); // 5% fee (placeholder)
      setTotalAmount(subtotal + serviceFee);
    } else {
      setTotalAmount(0);
    }
  }, [duration, equipment?.rate]);

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newBookingData = { ...bookingData, [field]: value };
    setBookingData(newBookingData);

    if (newBookingData.startDate && newBookingData.endDate) {
      const days = calculateDuration(newBookingData.startDate, newBookingData.endDate);
      setDuration(days > 0 ? days : 0);
    } else {
      setDuration(0);
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

  // Self-booking prevention (compare against equipment.owner_id)
  if (user?.id && equipment?.owner_id && user.id === equipment.owner_id) {
      setError("You can't book your own equipment.");
      return;
    }

    // Validate dates
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }
    if (start >= end) {
      setError('End date must be after start date');
      return;
    }
    if (duration < 1) {
      setError('Minimum booking duration is 1 day');
      return;
    }

    try {
      setError('');

      const days = duration;
      const subtotal = days * (equipment?.rate ?? 0);
  const serviceFee = Math.round(subtotal * 0.05); // align with displayed 5% service fee
      const total = subtotal + serviceFee;

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            equipment_id: equipment.id,
            user_id: user?.id,              // renter id
            start_date: bookingData.startDate,
            end_date: bookingData.endDate,
            days,
            rate_per_day: equipment.rate,
            subtotal,
            service_fee: serviceFee,
            total_amount: total,
            status: 'pending',
            notes: bookingData.notes || null
          }
        ]);

      if (bookingError) throw bookingError;

  setShowBookingModal(false);
  alert('Booking request sent. The owner will review and respond.');
      navigate('/dashboard'); // or navigate('/dashboard/renter/bookings')
    } catch (err: any) {
      console.error('Error booking:', err);
      setError(err.message || 'Failed to send booking request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-blue-900 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Slider */}
          <div className="relative mb-2">
            {loading ? (
              <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              </div>
            ) : imagesToShow.length > 0 ? (
              <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-gray-100">
                <Slider key={imagesToShow.length} {...(sliderSettings as any)} className="w-full h-full">
                  {imagesToShow.map((url, index) => (
                    <div key={index} className="w-full h-full aspect-video flex items-center justify-center">
                      <img
                        src={url}
                        alt={`${equipment?.title} ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
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
                  <HandCoins className="h-6 w-6 text-blue-900 mr-2" />
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
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Book Now
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold mb-4">Equipment Provider</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{equipment?.user_profiles?.company_name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-blue-900 mr-2" />
                <h3 className="text-lg font-semibold">Rental Protection</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-blue-900 rounded-full mr-2"></span>
                  Verified equipment provider
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-blue-900 rounded-full mr-2"></span>
                  Secure payments through our platform
                </li>
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
                title='Close'
                type='button'
                onClick={() => setShowLoginModal(false)}
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
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Book Equipment</h2>
              <button
                title='Close'
                type='button'
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 min-h-[300px] max-h-[calc(90vh-120px)] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  title='Start Date'
                  type="date"
                  required
                  value={bookingData.startDate}
                  onChange={(e) => {
                    handleDateChange('startDate', e.target.value);
                    setBookingData({ ...bookingData, startDate: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  title='End Date'
                  type="date"
                  required
                  value={bookingData.endDate}
                  onChange={(e) => {
                    handleDateChange('endDate', e.target.value);
                    setBookingData({ ...bookingData, endDate: e.target.value });
                  }}
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
                    <span className="font-medium">{duration} day{duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">R{totalAmount}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center">
                  <HandCoins className="h-6 w-6 text-blue-900 mr-2" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">R{equipment?.rate}</p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-500">Minimum booking: 1 day</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 bottom-0">
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
                  className="w-full py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Request Booking
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
