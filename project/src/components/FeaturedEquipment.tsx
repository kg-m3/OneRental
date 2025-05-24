import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

// Equipment data
const equipmentData = [
  {
    id: 1,
    title: 'Excavator',
    description: 'Perfect for digging, trenching, and demolition jobs.',
    image:
      'https://images.unsplash.com/photo-1610477865545-37711c53144d?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Heavy',
    location: 'Johannesburg',
    rate: '4,500',
    availability: 'Available Now',
  },
  {
    id: 2,
    title: 'Bulldozer',
    description: 'Ideal for heavy pushing and clearing operations.',
    image:
      'https://images.unsplash.com/photo-1646297970360-94c9f6d8903c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Heavy',
    location: 'Cape Town',
    rate: '5,200',
    availability: 'Available Now',
  },
  {
    id: 3,
    title: 'Crane',
    description: 'Heavy lifting made easy. Great for vertical builds.',
    image:
      'https://images.unsplash.com/photo-1539269071019-8bc6d57b0205?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Lifting',
    location: 'Durban',
    rate: '7,800',
    availability: 'Available in 3 days',
  },
];

const FeaturedEquipment = () => {
  return (
    <section id="equipment" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Popular Rentals Right Now
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Take a look at our most requested equipment—ready for your next job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipmentData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-sm overflow-hidden shadow-xl transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-60 object-cover"
                />
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {item.availability}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {item.title}
                  </h3>
                  <span className="text-green-600 font-semibold">
                    R{item.rate}/day
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{item.description}</p>

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{item.location}</span>
                </div>

                <Link
                  to={`/equipment/${item.id}`}
                  className="block w-full text-center py-3 bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-300 hover:bg-yellow-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/equipment"
            className="px-8 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg font-semibold transition-all duration-300 hover:bg-yellow-600 hover:text-white"
          >
            View All Equipment
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEquipment;
