import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Trash2, AlertTriangle, DollarSign, Clock, CheckCircle, XCircle, Plus, Settings, User, Edit, Power, Circle as CircleX, CheckCircle as CircleCheck, Eye, Calendar as CalendarIcon, MapPin, Phone, Mail, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, parseISO, isWithinInterval } from 'date-fns';
import DatePicker from 'react-datepicker';
import { useAuth } from '../../context/authContext';
import 'react-datepicker/dist/react-datepicker.css';

interface Equipment {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  rate: number;
  status: string;
  created_at: string;
  updated_at: string;
  equipment_images: {
    id: string;
    image_url: string;
    is_main: boolean;
    equipment_id: string;
  }[];
  owner_id: string;
};

interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  user_email: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
  equipment?: {
    title: string;
    type: string;
    equipment_images: {
      id: string;
      image_url: string;
      is_main: boolean;
    }[];
  };
};

interface BookingRequest {
  id: string;
  equipment_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
  equipment: {
    title: string;
    image_url: string;
  };
  users: {
    full_name: string;
  };
};

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('equipment');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    type: '',
    description: '',
    location: '',
    rate: 0,
    status: '',
    equipment_images: [] as {
      id: string;
      image_url: string;
      is_main: boolean;
      equipment_id: string;
    }[],
    owner_id: ''
  });

  const handleImageDelete = async (imageId: string) => {
    try {
      // Get the image path from the existing images
      const image = editFormData.equipment_images.find(img => img.id === imageId);
      if (!image) throw new Error('Image not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('equipment-images')
        .remove([`equipment/${selectedEquipment?.id}/${imageId}`]);

      if (storageError) throw storageError;

      // Update form data
      setEditFormData(prev => ({
        ...prev,
        equipment_images: prev.equipment_images.filter(img => img.id !== imageId)
      }));

      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check if file is an image and has allowed extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Only JPG, JPEG, PNG, and WEBP files are allowed.');
        return;
      }

      // Generate a unique filename with timestamp
      const fileName = `${Date.now()}-${file.name}`;
      // Check if selectedEquipment exists
      if (!selectedEquipment) {
        alert('Please select an equipment first.');
        return;
      }

      // Use simple path: public/equipment_id/filename
      const filePath = `public/${selectedEquipment.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(filePath);

      // Update form data
      setEditFormData(prev => ({
        ...prev,
        equipment_images: [...prev.equipment_images, {
          id: fileName,
          image_url: publicUrl,
          is_main: false,
          equipment_id: selectedEquipment?.id || ''
        }]
      }));

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    totalBookings: 0,
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setSelectedEquipmentId(equipment.id);
    setEditFormData({
      title: equipment.title,
      type: equipment.type,
      description: equipment.description,
      location: equipment.location,
      rate: equipment.rate,
      status: equipment.status,
      equipment_images: equipment.equipment_images,
      owner_id: equipment.owner_id
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'rate' ? Number(value) : value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First update the equipment table
      const equipmentData = {
        title: editFormData.title,
        type: editFormData.type,
        description: editFormData.description,
        location: editFormData.location,
        rate: editFormData.rate,
        status: editFormData.status,
        owner_id: editFormData.owner_id
      };

      const { error: equipmentError } = await supabase
        .from('equipment')
        .update(equipmentData)
        .eq('id', selectedEquipment?.id);

      if (equipmentError) throw equipmentError;

      // Then update the equipment_images table
      if (editFormData.equipment_images.length > 0) {
        // Prepare images data without IDs for new images
        const imagesToUpdate = editFormData.equipment_images.map(img => {
          // Only include ID if it exists and is a valid UUID
          const image: { id?: string; image_url: string; is_main: boolean; equipment_id: string } = {
            image_url: img.image_url,
            is_main: img.is_main,
            equipment_id: selectedEquipment?.id || ''
          };
          if (img.id && img.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            image.id = img.id;
          }
          return image;
        });

        const { error: imagesError } = await supabase
          .from('equipment_images')
          .upsert(imagesToUpdate);

        if (imagesError) throw imagesError;
      }

      // Update local state
      setEquipment((prev) =>
        prev.map((e) => (e.id === selectedEquipment?.id ? { ...e, ...editFormData } : e))
      );

      setIsEditModalOpen(false);
      setSelectedEquipment(null);
      setEditFormData({
        title: '',
        type: '',
        description: '',
        location: '',
        rate: 0,
        status: '',
        equipment_images: [],
        owner_id: ''
      });

      alert('Equipment updated successfully!');
    } catch (error) {
      console.error('Error updating equipment:', error);
      setError('Failed to update equipment. Please try again.');
      alert('Failed to update equipment. Please check the console for details.');
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedEquipment(null);
    setEditFormData({
      title: '',
      type: '',
      description: '',
      location: '',
      rate: 0,
      status: '',
      images: [{
        id: '',
        image_url: '',
        is_main: true
      }],
    });
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', selectedEquipmentId);

      if (error) throw error;

      // Update local state
      setEquipment((prev) => prev.filter((e) => e.id !== selectedEquipmentId));
      setStats({
        totalEquipment: equipment.length,
        activeBookings: bookings.filter((b) => b.status === 'active').length,
        totalBookings: bookings.length,
      });

      setDeleteConfirmOpen(false);
      setSelectedEquipmentId('');
      alert('Equipment deleted successfully!');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Failed to delete equipment. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // First fetch the equipment owned by the current user
    const fetchEquipment = supabase
      .from('equipment')
      .select(`
        *,
        equipment_images!inner (image_url, is_main)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    // Then fetch bookings for that equipment
    const fetchBookings = supabase
      .from('bookings')
      .select(`
        *,
        user_profiles!inner (full_name, email),
        equipment!inner (*)
      `)
      .order('created_at', { ascending: false });

    Promise.all([fetchEquipment, fetchBookings])
      .then(([equipmentResult, bookingsResult]) => {
        if (!user) {
          throw new Error('User not found');
        }

        const equipmentData = equipmentResult.data || [];
        const bookingsData = bookingsResult.data || [];
        console.log(equipmentData);

        // Update state
        setBookings(bookingsData);
        setEquipment(equipmentData);

        // Update stats
        setStats({
          totalEquipment: equipmentData.length,
          activeBookings: bookingsData.filter((b) => b.status === 'active').length,
          totalBookings: bookingsData.length,
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError(`Failed to load data: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      console.log(bookingId, action);
      const status = action === 'approve' ? 'active' : 'rejected';
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));

      console.log(`Booking ${bookingId} ${action}ed successfully`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const handleEquipmentStatus = async (equipmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({ status })
        .eq('id', equipmentId);

      if (error) throw error;

      // Update local state
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? { ...e, status } : e)));

      console.log(`Equipment ${equipmentId} status updated to ${status} successfully`);
    } catch (error) {
      console.error('Error updating equipment status:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = parseISO(booking.start_date);
    // Check if we got a valid date
    if (!bookingDate) return false;

    // Status filter
    if (selectedStatus !== 'all' && booking.status !== selectedStatus) {
      return false;
    }

    // Date range filter
    if (!startDate && !endDate) return true;
    if (startDate && endDate) {
      return isWithinInterval(bookingDate, { start: startDate, end: endDate });
    }
    if (startDate) {
      return bookingDate.getTime() >= startDate.getTime();
    }
    if (endDate) {
      return bookingDate.getTime() <= endDate.getTime();
    }
    return true;
  });

  const BookingDetailsModal = ({ booking, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Rental Request Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Renter Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{booking.user_profiles?.full_name}</span>
                  {/* {booking.user_profiles?.full_name || booking.user_profiles?.email} */}
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{booking.user_profiles?.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span>123 Construction Site, Johannesburg</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Equipment Details</h3>
              <div className="space-y-3">
                <p>
                  <strong>Equipment:</strong> {booking.equipment?.title}
                </p>
                <p>
                  <strong>Duration:</strong> {new Date(booking.start_date).toLocaleDateString()} -{' '}
                  {new Date(booking.end_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Amount:</strong> R{booking.total_amount}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  handleBookingAction(booking.id, 'reject');
                  onClose();
                }}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  handleBookingAction(booking.id, 'approve');
                  onClose();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Approve Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'equipment':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">My Equipment</h2>
              <Link
                to="/list-equipment"
                className="flex items-center px-3 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors md:px-4 md:py-2"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden md:inline ml-2 text-sm md:text-base">
                  Add New Equipment
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <img
                    src={item.equipment_images?.find((i) => i.is_main)?.image_url || '/default-equipment.jpg'}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          item.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'inactive'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="text-lg font-semibold text-green-600 mb-4">
                        R{item.rate}/day
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="space-x-2 flex">
                        <button
                          onClick={() => handleEditEquipment(item)}
                          className="px-1.5 py-1 border-2 border-blue-900 bg-blue-900 text-white rounded-md font-medium transition-all duration-300 hover:bg-blue-800 hover:border-blue-800 transition-colors text-sm"
                          title="Edit Equipment"
                        >
                          View Equipment
                        </button>

                        <button
                          onClick={() => {
                            const confirm = window.confirm(
                              `Mark equipment as ${item.status === 'available' ? 'inactive' : 'available'}?`
                            );
                            if (confirm) {
                              handleEquipmentStatus(item.id, item.status === 'available' ? 'inactive' : 'available');
                            }
                          }}
                          className="px-1.5 py-1 border-2 border-blue-900 bg-blue-900 text-white rounded-md font-medium transition-all duration-300 hover:bg-blue-800 hover:border-blue-800 transition-colors text-sm"
                          title={item.status === 'available' ? 'Mark as Inactive' : 'Mark as Available'}
                        >
                          {item.status === 'available' ? "Mark Inactive" : "Mark Active"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-bold">Rental Requests</h2>

              <div className="mb-6">
                {/* Mobile Filter Menu */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    <span>Filters</span>
                  </button>
                  
                  {isFilterMenuOpen && (
                    <div className="mt-2 p-4 bg-white rounded-lg shadow-md border">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                          <div className="flex space-x-4">
                            <div className="flex-1">
                              <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Start Date"
                                dateFormat="yyyy-MM-dd"
                                className="w-full p-2 border rounded-lg"
                              />
                            </div>
                            <div className="flex-1">
                              <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="End Date"
                                dateFormat="yyyy-MM-dd"
                                className="w-full p-2 border rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            className="w-full p-2 border rounded-lg"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                          >
                            <option value="all">All Requests</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setIsFilterMenuOpen(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setStartDate(null);
                              setEndDate(null);
                              setSelectedStatus('all');
                              setIsFilterMenuOpen(false);
                            }}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Filters */}
                <div className="hidden md:flex items-center space-x-4">
                  <div className="w-64">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      dateFormat="yyyy-MM-dd"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="w-64">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="End Date"
                      dateFormat="yyyy-MM-dd"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="w-64">
                    <select
                      className="p-2 border rounded-lg"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Requests</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                      setSelectedStatus('all');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
              {/* <div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
{{ ... }}
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div> */}
            </div>
          
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Renter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Equipment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <User className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                            {booking.user_profiles?.full_name || booking.user_profiles?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.equipment?.title}</div>
                        <div className="text-sm text-gray-500">{booking.equipment?.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.start_date).toLocaleDateString()} -{" "}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "active"
                              ? "bg-green-100 text-green-800"
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Calendar View</h2>
              <div className="flex space-x-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  onChange={(e) => {
                    // Add equipment filter logic here
                  }}
                >
                  <option value="all">All Equipment</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center text-gray-500">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4" />
                <p>Calendar view coming soon...</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Equipment</p>
              <h3 className="text-2xl font-bold">{stats.totalEquipment}</h3>
            </div>
            <Package className="h-8 w-8 text-blue-900" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Bookings</p>
              <h3 className="text-2xl font-bold">{stats.activeBookings}</h3>
            </div>
            <Calendar className="h-8 w-8 text-blue-900" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
            </div>
            <Calendar className="h-8 w-8 text-blue-900" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'equipment'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('equipment')}
          >
            Equipment
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Rental Requests
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'calendar'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderTabContent()}
      </div>

      {/* Equipment Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Equipment</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="relative">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <input
                      type="text"
                      name="type"
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
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate per day</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="rate"
                        value={editFormData.rate}
                        onChange={handleEditFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                        required
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
                  <div className="mt-2 space-y-4">
                    {/* Existing Images */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {Array.isArray(editFormData.equipment_images) && editFormData.equipment_images.length > 0 && editFormData.equipment_images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.image_url}
                            alt="Equipment"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleImageDelete(image.id)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <label className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Plus className="h-6 w-6 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click or drag and drop to upload images
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {deleteConfirmOpen && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Confirm Delete
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Are you sure you want to delete this equipment? This action cannot be undone.</p>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={handleDeleteConfirm}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;