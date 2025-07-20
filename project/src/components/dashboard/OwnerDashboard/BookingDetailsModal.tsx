import React from 'react';
import { XCircle, User, Phone, MapPin } from 'lucide-react';

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
    user_profiles?: {
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
}

const BookingDetailsModal: React.FC<BookingProps> = ({ booking, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold">Rental Request Details</h2>
        <button title='Close' type='button' onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XCircle className="h-6 w-6" />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Renter Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span>{booking.user_profiles?.full_name}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span>{booking.user_profiles?.email}</span>
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
              <p><strong>Equipment:</strong> {booking.equipment?.title}</p>
              <p><strong>Duration:</strong> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> R{booking.total_amount}</p>
              <p><strong>Status:</strong> {booking.status}</p>
            </div>
          </div>
        </div>

        {booking.status === 'pending' && (
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type='button'
              title='Reject Request'
              onClick={() => {
                // handle reject
                onClose();
              }}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
            >
              Reject Request
            </button>
            <button
              type='button'
              title='Approve Request'
              onClick={() => {
                // handle approve
                onClose();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve Request
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default BookingDetailsModal;
