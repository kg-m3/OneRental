import React, { useState, useCallback, useRef, useEffect } from 'react';
import { XCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import useFileUpload from '../../hooks/useFileUpload';

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
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<Record<string, string>>({});
  const inFlightRef = useRef<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    slots: fileSlots,
    isDragging,
    addFiles,
    removeFile,
    updateProgress,
    setIsDragging,
    hasErrors,
  } = useFileUpload({ maxSizeMB: 10, accept: 'image/*' });

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: name === 'rate' ? parseFloat(value) : value }));
  };

  // Upload a single file to Supabase storage (progress is simulated in steps)
  const uploadFile = useCallback(
    async (file: File, slotId: string) => {
      if (!file) return;
      try {
        updateProgress(slotId, 5);
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `public/${selectedEquipment?.id || 'temp'}/${fileName}`;

        updateProgress(slotId, 30);

        const { error: uploadError } = await supabase.storage
          .from('equipment-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        updateProgress(slotId, 80);

        const { data: { publicUrl } } = supabase.storage
          .from('equipment-images')
          .getPublicUrl(filePath);

        setUploadedImageUrls((prev) => ({ ...prev, [slotId]: publicUrl }));
        updateProgress(slotId, 100);
        return publicUrl;
      } catch (err) {
        console.error('Error uploading file:', err);
        updateProgress(slotId, 0);
        setError('Failed to upload image. Please try again.');
        throw err;
      }
    },
    [selectedEquipment?.id, updateProgress]
  );

  // 🔥 Auto-start uploads whenever new slots appear (don’t rely on addFiles return)
  useEffect(() => {
    // Start uploads for any slot we haven't started yet
    const toStart = Object.entries(fileSlots).filter(([slotId, s]) =>
      s.file &&
      !s.error &&
      !uploadedImageUrls[slotId] &&          // not finished
      !inFlightRef.current.has(slotId)       // not already started
    );
    if (toStart.length === 0) {
      // Update isUploading if everything is done
      const stillUploading =
        inFlightRef.current.size > 0 ||
        Object.entries(fileSlots).some(([slotId, s]) =>
          s.file && !s.error && (!uploadedImageUrls[slotId]) && ((s.progress ?? 0) < 100)
        );
      setIsUploading(stillUploading);
      return;
    }
  
    // Mark these as in-flight and kick them off
    toStart.forEach(([slotId]) => inFlightRef.current.add(slotId));
    setIsUploading(true);
  
    (async () => {
      await Promise.all(
        toStart.map(async ([slotId, s]) => {
          try {
            await uploadFile(s.file as File, slotId);
          } finally {
            // remove from in-flight whether success or error
            inFlightRef.current.delete(slotId);
          }
        })
      );
      // If nothing else in-flight and all slots done, turn spinner off
      const stillUploading =
        inFlightRef.current.size > 0 ||
        Object.entries(fileSlots).some(([slotId, s]) =>
          s.file && !s.error && (!uploadedImageUrls[slotId]) && ((s.progress ?? 0) < 100)
        );
      setIsUploading(stillUploading);
    })();
  }, [fileSlots, uploadedImageUrls, uploadFile]);
  

  // Dropzone handlers (only add files; effect above starts uploads)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true);
  }, [isDragging, setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  }, [setIsDragging]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) await addFiles(files);
  }, [addFiles, setIsDragging]);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageDelete = (id?: string) => {
    if (!id) return;
    setEditFormData((prev) => ({ ...prev, equipment_images: prev.equipment_images.filter((img) => img.id !== id) }));
  };

  const handleSetAsMain = async (imageId?: string) => {
    try {
      const updatedImages = editFormData.equipment_images.map((img) => ({ ...img, is_main: img.id === imageId }));
      setEditFormData((prev) => ({ ...prev, equipment_images: updatedImages }));
      await supabase.from('equipment_images').update({ is_main: false }).eq('equipment_id', selectedEquipment.id);
      await supabase.from('equipment_images').update({ is_main: true }).eq('id', imageId).eq('equipment_id', selectedEquipment.id);
    } catch (err) {
      console.error('Error setting main image:', err);
      setError('Failed to update main image. Please try again.');
    }
  };

  // Ensure all uploads finished before saving
  const getUploadedFiles = useCallback((): string[] => {
    const hasPending = Object.values(fileSlots).some((s) => typeof s.progress === 'number' && s.progress < 100);
    if (hasPending) {
      setError('Please wait for all images to finish uploading');
      return [];
    }
    return Object.values(uploadedImageUrls);
  }, [fileSlots, uploadedImageUrls]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    // ✅ Guard clauses BEFORE we set isSaving(true)
    if (hasErrors) {
      setError('Please fix file errors before saving.');
      return;
    }
  
    // If any slot is still uploading, bail out cleanly
    const hasPendingUploads = Object.values(fileSlots).some(
      s => typeof s.progress === 'number' && s.progress < 100
    );
    if (hasPendingUploads) {
      setError('Please wait for all images to finish uploading');
      return;
    }
  
    const uploadedUrls = getUploadedFiles(); // your helper just returns the URLs
    // If there are file slots but none finished, also bail (rare edge)
    if (uploadedUrls.length === 0 && Object.keys(fileSlots).length > 0) {
      setError('Please wait for all images to finish uploading');
      return;
    }
  
    setIsSaving(true);
    try {
      const newImages = uploadedUrls.map((url) => ({
        id: uuidv4(),
        image_url: url,
        is_main: false,
        equipment_id: selectedEquipment.id,
      }));
  
      const existingUrls = new Set(editFormData.equipment_images.map((img) => img.image_url));
      const uniqueNewImages = newImages.filter((img) => !existingUrls.has(img.image_url));
  
      const updatedEquipment = {
        ...editFormData,
        equipment_images: [...editFormData.equipment_images, ...uniqueNewImages],
      };
  
      // Update equipment core fields
      const { error: updateError } = await supabase
        .from('equipment')
        .update({
          title: updatedEquipment.title,
          type: updatedEquipment.type,
          description: updatedEquipment.description,
          location: updatedEquipment.location,
          rate: updatedEquipment.rate,
          status: updatedEquipment.status,
        })
        .eq('id', selectedEquipment.id);
      if (updateError) throw updateError;
  
      // Deletions
      const originalIds = (selectedEquipment.equipment_images || [])
        .map((i) => i.id)
        .filter(Boolean) as string[];
      const currentIds = (updatedEquipment.equipment_images || [])
        .map((i) => i.id)
        .filter(Boolean) as string[];
      const deletedImageIds = originalIds.filter((id) => !currentIds.includes(id));
  
      if (deletedImageIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('equipment_images')
          .delete()
          .in('id', deletedImageIds);
        if (deleteError) throw deleteError;
      }
  
      // Insert new images
      if (uniqueNewImages.length > 0) {
        const { error: insertError } = await supabase
          .from('equipment_images')
          .insert(uniqueNewImages);
        if (insertError) throw insertError;
      }
  
      setEditFormData(updatedEquipment);
      onSave(updatedEquipment);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save changes.');
    } finally {
      setIsSaving(false); // ✅ always turn it off
    }
  };
  

  const handleDeleteConfirm = async () => {
    try {
      const { data: images, error: imagesError } = await supabase
        .from('equipment_images')
        .select('image_url')
        .eq('equipment_id', selectedEquipment.id);
      if (imagesError) throw imagesError;

      if (images?.length) {
        const filePaths = images.map((img) => img.image_url.split('/').slice(4).join('/')).filter(Boolean);
        if (filePaths.length) {
          const { error: deleteFilesError } = await supabase.storage.from('equipment-images').remove(filePaths);
          if (deleteFilesError) console.error('Error deleting image files:', deleteFilesError);
        }
      }

      const { error: deleteImagesError } = await supabase.from('equipment_images').delete().eq('equipment_id', selectedEquipment.id);
      if (deleteImagesError) throw deleteImagesError;

      const { error: deleteEquipmentError } = await supabase.from('equipment').delete().eq('id', selectedEquipment.id);
      if (deleteEquipmentError) throw deleteEquipmentError;

      alert('Equipment and all related images deleted successfully!');
      onDelete?.(selectedEquipment.id);
      onClose();
    } catch (err) {
      console.error('Error deleting equipment:', err);
      alert('Failed to delete equipment. Please try again.');
    }
  };

  const disableSave = isUploading || isSaving;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit Equipment</h2>
          <button title="Close" type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
          {/* fields ... unchanged */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input title="Title" name="title" type="text" value={editFormData.title} onChange={handleEditFormChange}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <input title="Type" name="type" type="text" value={editFormData.type} onChange={handleEditFormChange}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea title="Description" name="description" value={editFormData.description} onChange={handleEditFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900" rows={3}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input title="Location" name="location" type="text" value={editFormData.location} onChange={handleEditFormChange}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate per day</label>
              <div className="flex items-center">
                <input title="Rate per day" name="rate" type="number" value={editFormData.rate} onChange={handleEditFormChange}
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"/>
                <span className="ml-2 text-gray-500">R</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select title="Status" name="status" value={editFormData.status} onChange={handleEditFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900">
              <option value="available">Available</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
                 onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
           {/* Existing images from DB */}
            {editFormData.equipment_images.map((image) => (
              <div key={image.id} className="relative group rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt="Equipment preview"
                  className="w-full h-32 object-cover"
                />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleImageDelete(image.id)}
                  className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow
                            hover:bg-gray-100 transition-opacity opacity-0 group-hover:opacity-100
                            focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  aria-label="Remove image"
                >
                  <XCircle className="h-5 w-5 text-blue-900" />
                </button>

                {/* Set main */}
                <button
                  type="button"
                  onClick={() => handleSetAsMain(image.id)}
                  className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded ${
                    image.is_main ? 'bg-blue-900 text-white' : 'bg-white/90 text-gray-800 hover:bg-white'
                  }`}
                  aria-label={image.is_main ? 'Main image' : 'Set as main image'}
                >
                  {image.is_main ? 'Main' : 'Set Main'}
                </button>
              </div>
            ))}


              {/* Pending uploads (from useFileUpload) */}
              {Object.entries(fileSlots).map(([slotId, slot]) => (
                <div
                  key={slotId}
                  className={`relative group rounded-lg overflow-hidden ${
                    slot.error ? 'ring-2 ring-red-300' : ''
                  }`}
                >
                  {/* Image (cover) or placeholder */}
                  <div className="w-full h-32 bg-gray-100">
                    {slot.previewUrl ? (
                      <img
                        src={slot.previewUrl}
                        alt="New image preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Preparing…
                      </div>
                    )}
                  </div>

                  {/* Delete (XCircle) */}
                  <button
                    type="button"
                    onClick={() => removeFile(slotId)}
                    className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow
                              hover:bg-gray-100 transition-opacity opacity-0 group-hover:opacity-100
                              focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                    aria-label="Remove image"
                  >
                    <XCircle className="h-5 w-5 text-blue-900" />
                  </button>

                  {/* Progress overlay */}
                  {typeof slot.progress === 'number' && !slot.error && slot.progress < 100 && (
                    <div className="absolute left-2 right-2 bottom-2">
                      <div className="w-full bg-white/70 rounded-full h-2">
                        <div
                          className="bg-blue-900 h-2 rounded-full transition-all"
                          style={{ width: `${slot.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-gray-700 bg-white/70 rounded px-1 inline-block">
                        {slot.progress}%
                      </div>
                    </div>
                  )}

                  {/* Ready state */}
                  {/* {slot.progress === 100 && !slot.error && (
                    <div className="absolute bottom-2 left-2 text-[10px] text-green-700 bg-white/80 rounded px-1">
                      Ready
                    </div>
                  )} */}

                  {/* Error badge */}
                  {slot.error && (
                    <div className="absolute bottom-2 left-2 text-[10px] text-red-700 bg-white/80 rounded px-1">
                      {slot.error}
                    </div>
                  )}
                </div>
              ))}


              {/* Add tile */}
              <div
                className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg flex flex-col items-center justify-center cursor-pointer h-32 transition-colors`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                role="button" tabIndex={0} aria-label="Add image"
              >
                <input title="Add image" ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileInputChange} className="hidden" disabled={isUploading}/>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Plus className="h-6 w-6 text-gray-400"/>
                    <span className="text-sm text-gray-600">Add image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between items-center gap-3 pt-2">
            <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="px-4 py-2 text-blue-900 rounded-lg hover:text-blue-800 flex items-center gap-1">
              <Trash2 className="h-5 w-5" /> Delete
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" form="editForm" className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60" disabled={disableSave}>
                {isSaving ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>) : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
              <div className="flex items-center mb-4"><span className="text-yellow-500 mr-2">⚠️</span><h3 className="text-lg font-semibold">Confirm Deletion</h3></div>
              <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete <strong>{selectedEquipment.title}</strong> and all its images? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
                <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentEditor;
