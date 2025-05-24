import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, PenTool as Tool, HandCoins, Shield, ArrowLeft, X } from 'lucide-react';

const EquipmentDetails = () => {
  const { id } = useParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // Mock data - in a real app, fetch this based on the ID
  const equipment = {
    id: 1,
    title: 'CAT 320 Excavator',
    description: 'Perfect for digging, trenching, and demolition jobs. This excavator comes with multiple bucket options and is well-maintained for optimal performance.',
    image: 'https://images.unsplash.com/photo-1610477865545-37711c53144d?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Heavy Equipment',
    location: 'Johannesburg',
    rate: '4,500',
    availability: 'Available',
    features: [
      'Operating Weight: 20,000 kg',
      'Max Digging Depth: 6.7m',
      'Engine Power: 122 kW',
      'Bucket Capacity: 1.2m³'
    ],
    owner: {
      name: 'Construction Solutions Ltd',
      rating: 4.8,
      responseTime: '< 2 hours'
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', {
      equipmentId: id,
      ...bookingData
    });
    alert('Booking request sent successfully! The owner will contact you shortly.');
    setShowBookingModal(false);
  };

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
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src={equipment.image}
                alt={equipment.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Features & Specifications</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipment.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Tool className="h-5 w-5 text-yellow-600 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{equipment.title}</h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {equipment.availability}
                </span>
              </div>

              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">{equipment.location}</span>
              </div>

              <p className="text-gray-600 mb-6">{equipment.description}</p>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center">
                  <HandCoins className="h-6 w-6 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">R{equipment.rate}</p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Book Now
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold mb-4">Equipment Provider</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{equipment.owner.name}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{equipment.owner.rating}</span>
                    </div>
                  </div>
                  {/* <button className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-600 hover:text-white transition-colors">
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
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-600 rounded-full mr-2"></span>
                  24/7 customer support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
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
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
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

              <div className="pt-4">
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