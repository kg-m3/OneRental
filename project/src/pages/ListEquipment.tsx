import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, MapPin, DollarSign, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker'; // <-- NEW

const ListEquipment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    location: '',     // keep as a human label (e.g., "Rayton, Gauteng")
    rate: '',
    images: [] as File[],
    status: 'available',
  });

  // NEW: map coordinates + label
  const [coords, setCoords] = useState<{ lat?: number; lng?: number; label?: string }>({});

  const [uploadedImages, setUploadedImages] = useState<{
    image_url: string;
    file_name: string;
    is_main: boolean;
  }[]>([]);

  const equipmentTypes = [
    'Excavator','Bulldozer','Crane','Loader','Hauler','Skid Steer',
    'Forklift','Compactor','Generator','Other'
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowed = ['jpg', 'jpeg', 'png', 'webp'];
      if (!ext || !allowed.includes(ext)) continue;

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `public/temp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(filePath);

      setUploadedImages(prev => [
        ...prev,
        { image_url: publicUrl, file_name: fileName, is_main: prev.length === 0 }
      ]);
    }
    e.target.value = '';
  };

  const removeImage = (image_url: string) => {
    setUploadedImages(prev => prev.filter(img => img.image_url !== image_url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to list equipment.');
      return;
    }

    // Require a pin on the map
    if (coords.lat == null || coords.lng == null) {
      alert('Please search and drop the pin on the map to set the exact location.');
      return;
    }

    try {
    const { data, error } = await supabase
        .from('equipment')
        .insert({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          location: formData.location || coords.label || '', // keep a readable label
      rate: Number(formData.rate),
          status: formData.status,
          owner_id: user.id,
          latitude: coords.lat,          // <-- NEW
          longitude: coords.lng,         // <-- NEW
        })
        .select();

      if (error) throw error;
      const equipmentId = data?.[0]?.id;

      if (uploadedImages.length > 0 && equipmentId) {
        const { error: imageSaveError } = await supabase
          .from('equipment_images')
          .upsert(
            uploadedImages.map(img => ({
              equipment_id: equipmentId,
              image_url: img.image_url,
              is_main: img.is_main,
            }))
          );
        if (imageSaveError) throw imageSaveError;
      }

      alert('Equipment listing submitted successfully!');
      setFormData({
        title: '',
        type: '',
        description: '',
        location: '',
        rate: '',
        images: [],
        status: 'available',
      });
      setCoords({});
      setUploadedImages([]);
      navigate(-1); // go back
    } catch (err: any) {
      console.error('Error submitting equipment:', err);
      const msg = err?.message || err?.error_description || String(err);
      alert(`Failed to submit equipment listing: ${msg}`);
    }
  };

  const hasMapToken = !!import.meta.env.VITE_MAPBOX_TOKEN;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-blue-900 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

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
                    Location (label shown to renters)
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Rayton, Gauteng"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: this is a readable label. The exact position is set on the map below.
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-2">
                    {hasMapToken
                      ? <>Search for the area (e.g., <strong>Rayton, Gauteng</strong>) then drag the pin to the exact yard entrance.</>
                      : <span className="text-amber-700">Map unavailable (missing token). Enter coordinates manually.</span>
                    }
                  </p>

                  {hasMapToken ? (
                    <MapPicker
                      value={coords.lat && coords.lng ? { lat: coords.lat, lng: coords.lng } : undefined}
                      onChange={(v) => setCoords(v)}
                      initialCenter={{ lat: -25.7388, lng: 28.5295 }}  // Rayton area
                      initialZoom={11}
                      country="ZA"
                      height={360}
                      className="rounded overflow-hidden border"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={coords.lat ?? ''}
                          onChange={(e) => setCoords({ ...coords, lat: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="-25.7388"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={coords.lng ?? ''}
                          onChange={(e) => setCoords({ ...coords, lng: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="28.5295"
                        />
                      </div>
                    </div>
                  )}

                  {coords.lat && coords.lng && (
                    <p className="text-xs mt-2">
                      Selected: {coords.label ?? 'custom pin'} · {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                  )}
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

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        <img
                          src={image.image_url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.image_url)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
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
  );
};

export default ListEquipment;
