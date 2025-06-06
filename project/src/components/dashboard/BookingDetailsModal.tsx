import React from 'react';
import { X } from 'lucide-react';
import { Booking } from './RenterDashboard';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-20 w-20">
              <img
                className="h-20 w-20 rounded-md"
                src={booking.equipment.images[0]?.image_url}
                alt={booking.equipment.title}
              />
            </div>
            <div className="ml-4">
              <div className="text-lg font-medium text-gray-900">
                {booking.equipment.title}
              </div>
              <div className="text-gray-500">{booking.equipment.location}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Dates</dt>
              <dd className="text-sm text-gray-900">
                {new Date(booking.start_date).toLocaleDateString()} -{' '}
                {new Date(booking.end_date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : booking.status === 'accepted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="text-sm text-gray-900">
                ${booking.total_amount?.toFixed(2) || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="text-sm text-gray-900">{booking.notes || 'No notes'}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
