import React, { useState } from 'react';
import { XCircle, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type Equipment = {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  rate: number;
  status: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  equipment_images: {
    id?: string;
    image_url: string;
    is_main: boolean;
    equipment_id: string;
  }[];
};

type Props = {
  selectedEquipment: Equipment;
  onClose: () => void;
  onSave: (updated: Equipment) => void;
};

const EquipmentEditor: React.FC<Props> = ({ selectedEquipment, onClose, onSave }) => {
  const [editFormData, setEditFormData] = useState<Equipment>({ ...selectedEquipment });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'rate' ? parseFloat(value) : value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEquipment) return;

    try {
      setIsUploading(true);
      
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ext || ext === '' || !allowedExtensions.includes(ext)) {
        alert('Only JPG, JPEG, PNG, and WEBP files are allowed.');
        setIsUploading(false);
        return;
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `public/${selectedEquipment.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(filePath);

      setEditFormData(prev => ({
        ...prev,
        equipment_images: [
          ...prev.equipment_images,
          {
            id: uuidv4(),
            image_url: publicUrl,
            is_main: prev.equipment_images.length === 0,
            equipment_id: selectedEquipment.id
          }
        ]
      }));

      event.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = (id: string) => {
    console.log("handl image delete -- init");
    console.log(editFormData.equipment_images);
    setEditFormData(prev => ({
      ...prev,
      equipment_images: prev.equipment_images.filter(img => img.id !== id)
    }));
    console.log("handl image delete -- finally");
    console.log(editFormData.equipment_images);
  };

  const isUUID = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const equipmentData = {
        title: editFormData.title,
        type: editFormData.type,
        description: editFormData.description,
        location: editFormData.location,
        rate: editFormData.rate,
        status: editFormData.status,
        owner_id: editFormData.owner_id
      };

      await supabase.from('equipment').update(equipmentData).eq('id', selectedEquipment.id);

      // Handle deletions
      const originalIds = selectedEquipment.equipment_images.map(i => i.id);
      const currentIds = editFormData.equipment_images.map(i => i.id);
      const deleted = originalIds.filter(id => !currentIds.includes(id));

      console.log("Handle submit --- Original ---> " + JSON.stringify(originalIds));
      console.log("Handle submit --- Current ---> " + JSON.stringify(currentIds));
      console.log("Handle submit --- Deleted ---> " + JSON.stringify(deleted));
      if (deleted.length > 0) {
        const { data, error } = await supabase.from('equipment_images').delete().in('id', deleted);
        console.log(data)
        if (error) throw error;
      }

      // Upsert new/updated
      const upserts = editFormData.equipment_images.map(img => {
        const {id, image_url, is_main } = img;
        const upsertData: any = {
          id,
          image_url,
          is_main,
          equipment_id: selectedEquipment.id
        };

    
        return upsertData;
      });
      
      console.log(upserts)
      if (upserts.length > 0) {
        await supabase.from('equipment_images').upsert(upserts, { onConflict: 'id' });
      }
      console.log("Handle submit --- Edit Form Data ---> " + JSON.stringify(editFormData));
      onSave({ ...editFormData });
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save changes.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Equipment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                type="text"
                value={editFormData.title}
                onChange={handleEditFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <input
                name="type"
                type="text"
                value={editFormData.type}
                onChange={handleEditFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={editFormData.description}
              onChange={handleEditFormChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                name="location"
                type="text"
                value={editFormData.location}
                onChange={handleEditFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate per day</label>
              <div className="flex items-center">
                <input
                  name="rate"
                  type="number"
                  value={editFormData.rate}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
                <span className="ml-2 text-gray-500">R</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={editFormData.status}
              onChange={handleEditFormChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            >
              <option value="available">Available</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {editFormData.equipment_images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.image_url}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(image.id)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-4">
              <label className="cursor-pointer">
                
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {isUploading ? (
                  <div className="flex flex-col items-center space-x-1">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload
                    </span>
                  </div> 
                )}
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Save Changes
            </button>
          </div>
        </form>

        <div className="absolute left-4 top-[calc(100%-2rem)]">
          <button type="button" className="text-red-500 hover:text-red-700">
            <Trash2 className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentEditor;
