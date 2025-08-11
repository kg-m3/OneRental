import React, { useState } from 'react';
import { XCircle, CheckCircle, AlertTriangle, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { Booking } from './RenterDashboard';
import PayNowButton from '../payment/PayNowButton';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>('');
  console.log('=== BookingDetailsModal Mounted ===');
  console.log('BookingDetailsModal - booking:', booking);
  console.log('BookingDetailsModal - onClose:', onClose);
  
  // Debug effect to log when the component mounts/unmounts
  React.useEffect(() => {
    console.log('BookingDetailsModal - Component mounted');
    return () => {
      console.log('BookingDetailsModal - Component unmounted');
    };
  }, []);
  
  // Calculate number of days
  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const handleCancelBooking = async () => {
    if (!booking?.id) return;
    
    setIsCancelling(true);
    setCancelError(null);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      // Close the modal and trigger a refresh in the parent
      onClose();
      // You might want to add a success toast/notification here
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setCancelError(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  console.log('=== BookingDetailsModal Rendered ===');
  console.log('Booking object:', JSON.parse(JSON.stringify(booking)));
  console.log('Booking status:', booking.status);
  console.log('Payment status:', booking.payment_status);
  console.log('Total amount:', booking.total_amount);
  console.log('Renter email:', booking.renter_email);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Booking Details</h2>
          <button title='Close' type='button' onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24">
              <img
                src={booking.equipment?.images?.find(img => img.is_main)?.image_url || '/default-equipment.jpg'}
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
                <p><strong>Equipment:</strong> {booking.equipment?.title}</p>
                <p><strong>Type:</strong> {booking.equipment?.type}</p>
                <p><strong>Location:</strong> {booking.equipment?.location}</p>
                <p><strong>Daily Rate:</strong> R{booking.equipment?.rate?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
              <div className="space-y-3">
                <p><strong>Rental Period:</strong> {days} day{days !== 1 ? 's' : ''}</p>
                <p><strong>Total Amount:</strong> R{(booking.total_amount || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span></p>
                <p><strong>Booking Date:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>

                {booking.notes && (
                  <div className="pt-2 border-t mt-3">
                    <div className="text-sm font-medium text-gray-500 mb-1">Your Notes</div>
                    <div className="text-sm bg-gray-50 p-3 rounded-md">
                      {booking.notes}
                    </div>
                  </div>
                )}
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
                <Link
                  to={`/equipment/${booking.equipment_id}`}
                  className="px-3 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Equipment
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCancelConfirm(true);
                  }}
                  disabled={isCancelling}
                  className="px-3 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold transition-all duration-300 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
              {cancelError && (
                <div className="p-2 bg-red-50 text-red-700 text-sm rounded">
                  {cancelError}
                </div>
              )}
            </div>
          )}

          {booking.status === 'accepted' && (booking.payment_status === undefined || booking.payment_status === 'pending') && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Payment Required</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Your booking has been accepted! Please complete your payment to secure it.
                </p>
                <PayNowButton
                  bookingId={booking.id}
                  email={booking.renter_email}
                  amountZarCents={Math.round((booking.total_amount || 0) * 100)}
                  onProvisionalSuccess={(reference) => {
                    console.log('Payment started with reference:', reference);
                    setPaymentReference(reference);
                    setShowSuccessModal(true);
                  }}
                  className="w-full md:w-auto"
                  label="Pay Now to Secure Booking"
                />
              </div>
            </div>
          )}

          {booking.status === 'accepted' && booking.payment_status === 'paid' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-800 font-medium">Payment Completed</span>
                </div>
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
      
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Cancel Booking</h3>
              <button 
                title="Close"
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isCancelling}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-yellow-500 mb-4">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <p className="text-gray-700">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex space-x-3 pt-4 border-t mt-4">
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Cancelling...
                    </>
                  ) : 'Yes, Cancel Booking'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out hover:bg-gray-50 disabled:opacity-50"
                >
                  No, Keep Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
              <button 
                title="Close"
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-500 mb-4">
                <CheckCircle className="h-12 w-12" />
              </div>
              <p className="text-gray-700">
                Your payment of <strong>R{(booking.total_amount || 0).toFixed(2)}</strong> was successful!
              </p>
              <p className="text-sm text-gray-500">
                Reference: {paymentReference}
              </p>
              <div className="pt-4 border-t mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsModal;
