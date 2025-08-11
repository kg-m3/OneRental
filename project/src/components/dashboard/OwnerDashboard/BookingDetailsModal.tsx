import React, { useState } from 'react';
import { X, User, Phone, MapPin } from 'lucide-react';

interface BookingProps {
  booking: {
    id: string;
    equipment_id: string;
    user_id: string;
    user_email: string;
    start_date: string;
    end_date: string;
    status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    user?: {
      full_name: string;
      email: string;
      phone: string;
    };
    equipment?: {
      title: string;
      type: string;
      equipment_images: {
        id: string;
        image_url: string;
        is_main: boolean;
      }[];
    };
  };
  onClose: () => void;
  onApprove?: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  onReject?: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

const BookingDetailsModal: React.FC<BookingProps> = ({ booking, onClose, onApprove, onReject }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    console.log('Approving booking:', booking.id)
    if (!onApprove) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, error } = await onApprove(booking.id);
      if (success) {
        onClose();
      } else {
        setError(error || 'Failed to approve booking');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error approving booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, error } = await onReject(booking.id);
      if (success) {
        onClose();
      } else {
        setError(error || 'Failed to reject booking');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error rejecting booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Rental Request Details</h2>
          <button title='Close'
            type="button"
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Renter Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{booking.user?.full_name || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{booking.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span>123 Construction Site, Johannesburg</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Equipment Details</h3>
              <div className="space-y-3">
                <p><strong>Equipment:</strong> {booking.equipment?.title || 'N/A'}</p>
                <p>
                  <strong>Duration:</strong> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                </p>
                <p><strong>Total Amount:</strong> R{booking.total_amount.toFixed(2)}</p>
                <p><strong>Status:</strong> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</p>
              </div>
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className="mt-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  title="Reject Request"
                  onClick={handleReject}
                  disabled={isLoading}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Reject Request'}
                </button>
                <button
                  type="button"
                  title="Approve Request"
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Approve Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
