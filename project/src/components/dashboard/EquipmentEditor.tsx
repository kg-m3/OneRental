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
  onDelete?: (deletedId: string) => void;
};

const EquipmentEditor: React.FC<Props> = ({ selectedEquipment, onClose, onSave, onDelete }) => {
  const [editFormData, setEditFormData] = useState<Equipment>({ ...selectedEquipment });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'rate' ? parseFloat(value) : value
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
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
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageDelete = (id: string | undefined) => {
    if (!id) return; // Handle the case where id is undefined
    console.log("handl image delete -- init");
    console.log(editFormData.equipment_images);
    setEditFormData(prev => ({
      ...prev,
      equipment_images: prev.equipment_images.filter(img => img.id !== id)
    }));
    console.log("handl image delete -- finally");
    console.log(editFormData.equipment_images);
  };

  
  const handleSetAsMain = async (imageId: string | undefined) => {
    try {
      // Update all images to set is_main to false
      const updatedImages = editFormData.equipment_images.map(img => ({
        ...img,
        is_main: img.id === imageId,
      }));
  
      setEditFormData(prev => ({
        ...prev,
        equipment_images: updatedImages,
      }));
  
      // Update the database
      await supabase
        .from('equipment_images')
        .update({ is_main: false })
        .eq('equipment_id', selectedEquipment.id);
  
      await supabase
        .from('equipment_images')
        .update({ is_main: true })
        .eq('id', imageId)
        .eq('equipment_id', selectedEquipment.id);
  
    } catch (error) {
      console.error('Error setting main image:', error);
      setError('Failed to update main image. Please try again.');
    }
  };

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

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  
  const handleDeleteConfirm = async () => {
    try {
      // 1. Get all images related to this equipment
      const { data: images, error: imagesError } = await supabase
        .from('equipment_images')
        .select('image_url')
        .eq('equipment_id', selectedEquipment.id);
  
      if (imagesError) throw imagesError;
  
      // 2. Delete all images from storage
      if (images && images.length > 0) {
        const filePaths = images.map((img) =>
          img.image_url.split('/').slice(4).join('/')
        );
        const { error: deleteFilesError } = await supabase.storage
          .from('equipment-images')
          .remove(filePaths);
  
        if (deleteFilesError) console.error('Error deleting image files:', deleteFilesError);
      }
  
      // 3. Delete all image records from DB
      const { error: deleteImagesError } = await supabase
        .from('equipment_images')
        .delete()
        .eq('equipment_id', selectedEquipment.id);
  
      if (deleteImagesError) throw deleteImagesError;
  
      // 4. Delete the equipment itself
      const { error: deleteEquipmentError } = await supabase
        .from('equipment')
        .delete()
        .eq('id', selectedEquipment.id);
  
      if (deleteEquipmentError) throw deleteEquipmentError;
  
      // 5. Alert + Close
      alert('Equipment and all related images deleted successfully!');
      onDelete?.(selectedEquipment.id);
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Failed to delete equipment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit Equipment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                type="text"
                value={editFormData.title}
                onChange={handleEditFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                name="location"
                type="text"
                value={editFormData.location}
                onChange={handleEditFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
            >
              <option value="available">Available</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {editFormData.equipment_images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt="Equipment preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(image.id)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete image"
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAsMain(image.id)}
                    className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded ${
                      image.is_main 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-white/90 text-gray-800 hover:bg-white'
                    }`}
                    aria-label={image.is_main ? 'Main image' : 'Set as main image'}
                  >
                    {image.is_main ? 'Main' : 'Set Main'}
                  </button>
                </div>
              ))}
              
              {/* Add Image Tile */}
              <div 
                className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg flex flex-col items-center justify-center cursor-pointer h-32 transition-colors`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Add image"
                aria-busy={isUploading}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-600">Add image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 text-blue-900 rounded-lg hover:text-blue-800 flex items-center gap-1"
            >
              <Trash2 className="h-5 w-5" /> Delete
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editForm"
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>

        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedEquipment.title}</strong> and all its images? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentEditor;
