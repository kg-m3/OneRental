import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
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
}

// Equipment data
// const equipmentData = [
//   {
//     id: 1,
//     title: 'Excavator',
//     description: 'Perfect for digging, trenching, and demolition jobs.',
//     image:
//       'https://images.unsplash.com/photo-1610477865545-37711c53144d?q=80&w=2047&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     type: 'Heavy',
//     location: 'Johannesburg',
//     rate: '4,500',
//     availability: 'Available Now',
//   },
//   {
//     id: 2,
//     title: 'Bulldozer',
//     description: 'Ideal for heavy pushing and clearing operations.',
//     image:
//       'https://images.unsplash.com/photo-1646297970360-94c9f6d8903c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     type: 'Heavy',
//     location: 'Cape Town',
//     rate: '5,200',
//     availability: 'Available Now',
//   },
//   {
//     id: 3,
//     title: 'Crane',
//     description: 'Heavy lifting made easy. Great for vertical builds.',
//     image:
//       'https://images.unsplash.com/photo-1539269071019-8bc6d57b0205?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     type: 'Lifting',
//     location: 'Durban',
//     rate: '7,800',
//     availability: 'Available in 3 days',
//   },
// ];

const FeaturedEquipment = () => {

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
        .order('created_at', { ascending: false })
        .limit(3);

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


  return (
    <section id="equipment" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
           Featured Equipment
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Take a look at a few standout machines—ready to power your next project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-sm overflow-hidden shadow-xl transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div
                className="group relative overflow-hidden rounded-lg h-64 md:h-80"
              >
                {item.images.length > 0 && (
                  <img
                    src={item.images.find(img => img.is_main)?.image_url || item.images[0].image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" /> */}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-blue-800">
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
                  className="block w-full text-center py-3 bg-blue-900 text-white rounded-lg font-medium transition-colors duration-300 hover:bg-blue-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/all-equipment"
            className="px-8 py-3 border-2 border-blue-800 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-800 hover:text-white"
          >
            View All Equipment
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEquipment;
