import React from 'react';
import { HandCoins, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListingCTA = () => {
  return (
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
          <Link
            to="/list-equipment"
            className="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold text-lg shadow-xl transition-all duration-300 hover:bg-gray-100 hover:scale-105"
          >
            Start Listing Your Equipment
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ListingCTA;