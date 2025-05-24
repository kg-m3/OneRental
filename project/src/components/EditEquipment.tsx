// import React, { useState } from 'react';
// import { X, Upload, MapPin, DollarSign, PenTool as Tool } from 'lucide-react';

// interface EditEquipmentProps {
//   equipment: {
//     id: string;
//     title: string;
//     type: string;
//     description: string;
//     location: string;
//     rate: number;
//     status: string;
//     features: string[];
//     images: string[];
//   };
//   onSave: (data: any) => void;
//   onClose: () => void;
// }

// const EditEquipment: React.FC<EditEquipmentProps> = ({ equipment, onSave, onClose }) => {
//   const [formData, setFormData] = useState({
//     ...equipment,
//   });

//   const equipmentTypes = [
//     'Excavator',
//     'Bulldozer',
//     'Crane',
//     'Loader',
//     'Hauler',
//     'Skid Steer',
//     'Forklift',
//     'Compactor',
//     'Generator',
//     'Other'
//   ];

//   const availabilityStatuses = [
//     'available',
//     'rented',
//     'maintenance',
//     'reserved'
//   ];

//   const handleFeatureChange = (index: number, value: string) => {
//     const newFeatures = [...formData.features];
//     newFeatures[index] = value;
//     setFormData({ ...formData, features: newFeatures });
//   };

//   const addFeature = () => {
//     setFormData({ ...formData, features: [...formData.features, ''] });
//   };

//   const removeFeature = (index: number) => {
//     const newFeatures = formData.features.filter((_, i) => i !== index);
//     setFormData({ ...formData, features: newFeatures });
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files) {
//       const newImages = Array.from(files).map(file => URL.createObjectURL(file));
//       setFormData({ ...formData, images: [...formData.images, ...newImages] });
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center p-6 border-b">
//           <h2 className="text-xl font-bold text-gray-800">Edit Equipment</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Equipment Title
//               </label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Equipment Type
//               </label>
//               <select
//                 value={formData.type}
//                 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               >
//                 {equipmentTypes.map((type) => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Availability Status
//               </label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               >
//                 {availabilityStatuses.map((status) => (
//                   <option key={status} value={status}>
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 rows={4}
//                 required
//               />
//             </div>
//           </div>

//           {/* Location and Rate */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <MapPin className="inline-block h-4 w-4 mr-1" />
//                 Location
//               </label>
//               <input
//                 type="text"
//                 value={formData.location}
//                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <DollarSign className="inline-block h-4 w-4 mr-1" />
//                 Daily Rate (R)
//               </label>
//               <input
//                 type="number"
//                 value={formData.rate}
//                 onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Features */}
//           <div>
//             <h3 className="text-lg font-medium mb-4">
//               <Tool className="inline-block h-5 w-5 mr-2" />
//               Features & Specifications
//             </h3>

//             <div className="space-y-4">
//               {formData.features.map((feature, index) => (
//                 <div key={index} className="flex gap-2">
//                   <input
//                     type="text"
//                     value={feature}
//                     onChange={(e) => handleFeatureChange(index, e.target.value)}
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                   />
//                   {index > 0 && (
//                     <button
//                       type="button"
//                       onClick={() => removeFeature(index)}
//                       className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={addFeature}
//                 className="text-yellow-600 hover:text-yellow-700 font-medium"
//               >
//                 + Add Feature
//               </button>
//             </div>
//           </div>

//           {/* Images */}
//           <div>
//             <h3 className="text-lg font-medium mb-4">
//               <Upload className="inline-block h-5 w-5 mr-2" />
//               Equipment Images
//             </h3>

//             <div className="space-y-4">
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                   id="edit-images"
//                 />
//                 <label
//                   htmlFor="edit-images"
//                   className="cursor-pointer text-yellow-600 hover:text-yellow-700 font-medium"
//                 >
//                   Click to upload images
//                 </label>
//               </div>

//               {formData.images.length > 0 && (
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   {formData.images.map((image, index) => (
//                     <div key={index} className="relative">
//                       <img
//                         src={image}
//                         alt={`Preview ${index + 1}`}
//                         className="w-full h-32 object-cover rounded-lg"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setFormData({
//                           ...formData,
//                           images: formData.images.filter((_, i) => i !== index)
//                         })}
//                         className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
//             >
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditEquipment;
