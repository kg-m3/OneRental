import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface EquipmentItem {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  rate: string;
  status: string;
  images: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
};

const AllEquipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;
      
      if (equipmentData) {
        const equipmentWithImages = await Promise.all(
          equipmentData.map(async (item) => {
            const { data: images, error: imagesError } = await supabase
              .from('equipment_images')
              .select('*')
              .eq('equipment_id', item.id)
              .order('is_main', { ascending: false });

            if (imagesError) {
              console.error(`Error fetching images for equipment ${item.id}:`, imagesError);
              return { ...item, images: [] };
            }

            return { ...item, images };
          })
        );

        setEquipment(equipmentWithImages);
      }
    } catch (err) {
      setError('Failed to fetch equipment data');
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };



  const types = ['All', ...new Set(equipment.map((item) => item.type))];

  const filteredEquipment = equipment.filter((item) => {
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
                  src={item.images?.find(img => img.is_main)?.image_url || ''}
                  alt={item.title}
                  className="w-full h-60 object-cover"
                />
                <div 
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {item.status}
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
