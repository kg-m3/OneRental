import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, MapPin, DollarSign, PenTool as Tool, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';

const ListEquipment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log(user);
  if (!user) {
    console.log(user);
    // return <Navigate to="/login" />;
  }
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    location: '',
    rate: '',
    // features: [''],
    images: [] as string[],
    status: 'Available'
  });

  const equipmentTypes = [
    'Excavator',
    'Bulldozer',
    'Crane',
    'Loader',
    'Hauler',
    'Skid Steer',
    'Forklift',
    'Compactor',
    'Generator',
    'Other'
  ];

  // const handleFeatureChange = (index: number, value: string) => {
  //   const newFeatures = [...formData.features];
  //   newFeatures[index] = value;
  //   setFormData({ ...formData, features: newFeatures });
  // };

  // const addFeature = () => {
  //   setFormData({ ...formData, features: [...formData.features, ''] });
  // };

  // const removeFeature = (index: number) => {
  //   const newFeatures = formData.features.filter((_, i) => i !== index);
  //   setFormData({ ...formData, features: newFeatures });
  // };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          location: formData.location,
          rate: formData.rate,
          // features: formData.features.filter(f => f.trim() !== ''),
          status: formData.status,
          owner_id: user.id // Add owner_id to link equipment to user
        }).select();

      if (error) throw error;
      console.log(data);
      
      // Upload additional images if any
      if (formData.images.length > 0 ) {
        const additionalImages = formData.images.slice(1);
        for (const image of formData.images) {
          const imagesResult = await supabase  
            .from('equipment_images')
            .insert({
              equipment_id: data?.[0].id,
              image_url: image,
              is_main: image === formData.images[0]
            });

            if (imagesResult.error) {
              throw new Error('Failed to upload image');
            }
        }
      }

      alert('Equipment listing submitted successfully!');
      setFormData({
        title: '',
        type: '',
        description: '',
        location: '',
        rate: '',
        // features: [''],
        images: [],
        status: 'Available'
      });
    } catch (err) {
      console.error('Error submitting equipment:', err);
      alert('Failed to submit equipment listing. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-blue-900 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="max-w-3xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">List Your Equipment</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., CAT 320 Excavator"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={4}
                    placeholder="Describe your equipment's capabilities and condition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location and Pricing */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Location & Pricing</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline-block h-4 w-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Johannesburg"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="inline-block h-4 w-4 mr-1" />
                    Daily Rate (R)
                  </label>
                  <input
                    type="number"
                    id="rate"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., 4500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            {/* <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                <Tool className="inline-block h-5 w-5 mr-2" />
                Features & Specifications
              </h2>
              
              <div className="space-y-4">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., Operating Weight: 20,000 kg"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-900 hover:text-blue-800 font-medium"
                >
                  + Add Feature
                </button>
              </div>
            </div> */}

            {/* Images */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                <Upload className="inline-block h-5 w-5 mr-2" />
                Equipment Images
              </h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-800 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="images"
                  />
                  <label
                    htmlFor="images"
                    className="cursor-pointer text-blue-900 hover:text-blue-800 font-medium"
                  >
                    Click to upload images
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload high-quality images of your equipment
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== index)
                          })}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg"
            >
              List Equipment
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ListEquipment;