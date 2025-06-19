import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, HandCoins, X } from 'lucide-react';
import { useAuth } from '../context/authContext';

import { useState } from 'react';

const ListingCTA = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleListEquipment = () => {
    if (loading) return;
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check if user has owner role
    if (!user.roles?.includes('owner')) {
      // Redirect to auth with a message about needing owner role
      navigate('/auth', { state: { message: 'You need to have an owner account to list equipment' } });
      return;
    }

    // Open listing modal
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <section className="py-20 bg-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 right-0 h-32 bg-white transform -skew-y-6 origin-top-left"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white transform skew-y-6 origin-bottom-right"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Own Equipment? Start Earning</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Got machinery sitting idle? Put it to work and earn passive income. List it for free and get connected to verified renters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-white">
            <div className="flex justify-center mb-4">
              <HandCoins className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Generate Income</h3>
            <p className="text-white/80 text-center">
              Turn your idle equipment into a revenue stream. Our owners report earning up to R30,000 per month.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-white">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Secure Transactions</h3>
            <p className="text-white/80 text-center">
              All renters are verified. We provide insurance options and secure payment processing.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-white">
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Flexible Scheduling</h3>
            <p className="text-white/80 text-center">
              You control availability. Set your own rental periods, rates, and conditions.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleListEquipment}
            className="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold text-lg shadow-xl transition-all duration-300 hover:bg-gray-100 hover:scale-105"
          >
            Start Listing Your Equipment
          </button>
        </div>
      </div>
    </section>

    {/* Login Modal */}
    {showLoginModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-32 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Please Login</h2>
            <button
              onClick={() => setShowLoginModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-600 text-center">
              You need to be logged in to list equipment. Please login or create an account.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/auth');
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
    {isModalOpen && (
      <ListingModal
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          // Handle listing submission
          console.log('Listing submitted:', data);
          setIsModalOpen(false);
          navigate('/owner-dashboard');
        }}
      />
    )}
    </>
  );
};

export default ListingCTA;