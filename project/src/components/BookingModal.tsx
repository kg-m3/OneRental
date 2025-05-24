// import React, { useState } from 'react';
// import { X, Calendar, Clock, FileText, AlertTriangle } from 'lucide-react';

// interface BookingModalProps {
//   equipment: {
//     id: string;
//     title: string;
//     rate: number;
//   };
//   onSubmit: (bookingData: BookingData) => void;
//   onClose: () => void;
// }

// interface BookingData {
//   startDate: string;
//   endDate: string;
//   notes: string;
//   duration: number;
//   totalAmount: number;
// }

// const BookingModal: React.FC<BookingModalProps> = ({
//   equipment,
//   onSubmit,
//   onClose,
// }) => {
//   const [formData, setFormData] = useState({
//     startDate: '',
//     endDate: '',
//     notes: '',
//   });

//   const [duration, setDuration] = useState(0);
//   const [totalAmount, setTotalAmount] = useState(0);

//   const calculateDuration = (start: string, end: string) => {
//     const startDate = new Date(start);
//     const endDate = new Date(end);
//     const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
//     const newFormData = { ...formData, [field]: value };
//     setFormData(newFormData);

//     if (newFormData.startDate && newFormData.endDate) {
//       const days = calculateDuration(
//         newFormData.startDate,
//         newFormData.endDate
//       );
//       setDuration(days);
//       setTotalAmount(days * equipment.rate);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit({
//       ...formData,
//       duration,
//       totalAmount,
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//         <div className="flex justify-between items-center p-6 border-b">
//           <h2 className="text-xl font-bold text-gray-800">Book Equipment</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div>
//             <h3 className="font-semibold text-gray-800 mb-2">
//               {equipment.title}
//             </h3>
//             <p className="text-gray-600">Daily Rate: R{equipment.rate}</p>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Calendar className="inline-block h-4 w-4 mr-1" />
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 value={formData.startDate}
//                 onChange={(e) => handleDateChange('startDate', e.target.value)}
//                 min={new Date().toISOString().split('T')[0]}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Calendar className="inline-block h-4 w-4 mr-1" />
//                 End Date
//               </label>
//               <input
//                 type="date"
//                 value={formData.endDate}
//                 onChange={(e) => handleDateChange('endDate', e.target.value)}
//                 min={
//                   formData.startDate || new Date().toISOString().split('T')[0]
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <FileText className="inline-block h-4 w-4 mr-1" />
//                 Additional Notes
//               </label>
//               <textarea
//                 value={formData.notes}
//                 onChange={(e) =>
//                   setFormData({ ...formData, notes: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 rows={4}
//                 placeholder="Any special requirements or questions?"
//               />
//             </div>
//           </div>

//           {duration > 0 && (
//             <div className="bg-gray-50 p-4 rounded-lg space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">
//                   <Clock className="inline-block h-4 w-4 mr-1" />
//                   Duration:
//                 </span>
//                 <span className="font-medium">{duration} days</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Total Amount:</span>
//                 <span className="font-bold text-lg">R{totalAmount}</span>
//               </div>
//             </div>
//           )}

//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//             <div className="flex items-start">
//               <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
//               <div>
//                 <h4 className="text-yellow-800 font-medium">Important Note</h4>
//                 <p className="text-yellow-600 text-sm mt-1">
//                   This is a booking request. The equipment owner will review and
//                   confirm your booking.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
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
//               Submit Booking Request
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;
