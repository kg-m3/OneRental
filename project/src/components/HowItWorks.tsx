import React from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Truck, Star } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-yellow-600" />,
      title: '1. Browse Equipment',
      description:
        'Explore available machinery by type, location, and availability.',
    },
    {
      icon: <BookOpen className="h-10 w-10 text-yellow-600" />,
      title: '2. Book with Confidence',
      description:
        'Send rental requests, get pricing and details, and finalize your booking online.',
    },
    {
      icon: <Truck className="h-10 w-10 text-yellow-600" />,
      title: '3. Get to Work',
      description: 'Pick up or arrange delivery. Use the equipment as agreed.',
    },
    // {
    //   icon: <Star className="h-10 w-10 text-yellow-600" />,
    //   title: '4. Review & Repeat',
    //   description: 'Leave feedback and keep your project moving forward.'
    // }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our simple process gets you the equipment you need when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/equipment"
            className="px-8 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
          >
            Start Browsing
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
