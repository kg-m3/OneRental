import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const AllEquipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const equipmentData = [
    {
      id: 1,
      title: 'CAT 320 Excavator',
      description: 'Perfect for digging, trenching, and demolition jobs.',
      image:
        'https://images.unsplash.com/photo-1610477865545-37711c53144d?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Excavator',
      location: 'Johannesburg',
      rate: '4,500',
      availability: 'Available Now',
    },
    {
      id: 2,
      title: 'Komatsu D61 Bulldozer',
      description: 'Ideal for heavy pushing and clearing operations.',
      image:
        'https://images.unsplash.com/photo-1630288214032-2c4cc2c080ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnVsbGRvemVyfGVufDB8fDB8fHww',
      type: 'Bulldozer',
      location: 'Cape Town',
      rate: '5,200',
      availability: 'Available Now',
    },
    {
      id: 3,
      title: 'Liebherr Tower Crane',
      description: 'Heavy lifting made easy. Great for vertical builds.',
      image:
        'https://images.unsplash.com/photo-1539269071019-8bc6d57b0205?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Crane',
      location: 'Durban',
      rate: '7,800',
      availability: 'Available in 3 days',
    },
    {
      id: 4,
      title: 'JCB 3CX Backhoe Loader',
      description: 'Versatile machine for digging and loading operations.',
      image:
        'https://images.unsplash.com/photo-1646297970360-94c9f6d8903c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Loader',
      location: 'Pretoria',
      rate: '3,800',
      availability: 'Available Now',
    },
    {
      id: 5,
      title: 'Volvo A40G Articulated Hauler',
      description: 'Efficient material transport for large construction sites.',
      image:
        'https://images.unsplash.com/photo-1629807472592-2649bfa09f9c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHVtcCUyMHRydWNrfGVufDB8fDB8fHww',
      type: 'Hauler',
      location: 'Port Elizabeth',
      rate: '6,500',
      availability: 'Available Tomorrow',
    },
    {
      id: 6,
      title: 'CAT 2460 Skid Steer',
      description: 'Compact and versatile for various construction tasks.',
      image:
        'https://images.pexels.com/photos/8808933/pexels-photo-8808933.jpeg?auto=compress&cs=tinysrgb&w=600https://images.pexels.com/photos/8808933/pexels-photo-8808933.jpeg?auto=compress&cs=tinysrgb&w=600',
      type: 'Skid Steer',
      location: 'Bloemfontein',
      rate: '2,800',
      availability: 'Available Now',
    },
  ];

  const types = ['All', ...new Set(equipmentData.map((item) => item.type))];

  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Available Equipment
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white w-full sm:w-48"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-60 object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
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
      </div>
    </div>
  );
};

export default AllEquipment;
