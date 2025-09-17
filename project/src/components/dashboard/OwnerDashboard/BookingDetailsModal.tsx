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
  risk?: { score: number; level: 'low'|'medium'|'high'; reasons: string[] };
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
  onDeliver?: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  onComplete?: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
}

const BookingDetailsModal: React.FC<BookingProps> = ({ booking, onClose, onApprove, onReject, onDeliver, onComplete }) => {
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

  const handleDeliver = async () => {
    if (!onDeliver) return;
    setIsLoading(true);
    setError(null);
    try {
      const { success, error } = await onDeliver(booking.id);
      if (success) {
        onClose();
      } else {
        setError(error || 'Failed to mark as delivered');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error delivering booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    setIsLoading(true);
    setError(null);
    try {
      const { success, error } = await onComplete(booking.id);
      if (success) {
        onClose();
      } else {
        setError(error || 'Failed to complete booking');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error completing booking:', err);
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
          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-600 mb-2">Progress</h3>
            {(() => {
              const lifecycle = [
                { key: 'pending', label: 'Pending' },
                { key: 'accepted', label: 'Accepted' },
                { key: 'active', label: 'Active' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'returned', label: 'Returned' },
                { key: 'completed', label: 'Completed' }
              ];
              const negative = ['rejected','cancelled'];
              const isNegative = negative.includes(booking.status);
              const normalizedStatus = booking.status === 'paid' ? 'completed' : booking.status;
              const currentIndex = lifecycle.findIndex(m => m.key === normalizedStatus);
              if (isNegative) {
                return (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <span className="font-semibold">×</span>
                    <span>{booking.status === 'rejected' ? 'Request Rejected' : 'Booking Cancelled'}</span>
                  </div>
                );
              }
              return (
                <div className="relative">
                  <div className="flex w-full">
                    {lifecycle.map((m, idx) => {
                      const reached = currentIndex >= idx && currentIndex !== -1;
                      const last = idx === lifecycle.length - 1;
                      return (
                        <div key={m.key} className="flex-1 flex flex-col items-center relative">
                          <div className={`h-4 w-4 rounded-full border z-10 ${reached ? 'bg-blue-900 border-blue-900' : 'bg-white border-gray-300'}`} title={m.label} />
                          {!last && (
                            <div className={`absolute top-1.5 left-1/2 w-full h-[3px] ${currentIndex >= idx + 1 ? 'bg-blue-900' : 'bg-gray-200'}`} />
                          )}
                          <span className="mt-1 text-[10px] text-gray-500 whitespace-nowrap">{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
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

          {booking.risk && (
            <div className="mt-6 bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Risk Assessment</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  booking.risk.level === 'high' ? 'bg-red-100 text-red-700' :
                  booking.risk.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {booking.risk.level.toUpperCase()} • {booking.risk.score}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Reasons</p>
                <ul className="list-disc pl-5 text-sm text-gray-800">
                  {booking.risk.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Suggested actions</p>
                <ul className="list-disc pl-5 text-sm text-gray-800">
                  {booking.risk.level === 'high' && (
                    <>
                      <li>Require enhanced KYC (ID + proof of address)</li>
                      <li>Collect higher deposit or partial prepayment</li>
                      <li>Confirm jobsite and delivery contact details</li>
                    </>
                  )}
                  {booking.risk.level === 'medium' && (
                    <>
                      <li>Collect standard deposit</li>
                      <li>Confirm dates and scope via phone</li>
                    </>
                  )}
                  {booking.risk.level === 'low' && (
                    <>
                      <li>Proceed with standard process</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

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

          {['accepted','active','delivered'].includes(booking.status) && (
            <div className="mt-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                {['accepted','active'].includes(booking.status) && (
                  <button
                    type="button"
                    title="Mark as Delivered"
                    onClick={handleDeliver}
                    disabled={isLoading}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Mark Delivered'}
                  </button>
                )}
                {['active','delivered'].includes(booking.status) && (
                  <button
                    type="button"
                    title="Mark as Returned / Complete"
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Mark Returned'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
