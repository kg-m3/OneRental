import { useState, useEffect } from 'react';
import { parseISO, isWithinInterval } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/authContext';

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
      id?: string;
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

const useOwnerDashboard = () => {
  const { user } = useAuth();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('equipment');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type StatusModalState = {
    isOpen: boolean;
    status: 'success' | 'error';
    message: string;
  };

  const [statusModal, setStatusModal] = useState<StatusModalState>({
    isOpen: false,
    status: 'success',
    message: '',
  });
  
  const showStatus = (status: 'success' | 'error', message: string) => {
    setStatusModal({
      isOpen: true,
      status,
      message,
    });
  };
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeBookings: 0,
    totalBookings: 0,
  });

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  useEffect(() => {
    if (!user?.id) return;
    fetchDashboardData();
    checkVerificationStatus();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // First, get all equipment owned by the user
      const { data: ownerEquipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('id')
        .eq('owner_id', user.id);

      if (equipmentError) throw equipmentError;

      const equipmentIds = ownerEquipment?.map(eq => eq.id) || [];

      // If owner has no equipment, set empty results
      if (equipmentIds.length === 0) {
        setEquipment([]);
        setBookings([]);
        setStats({
          totalEquipment: 0,
          activeBookings: 0,
          totalBookings: 0,
        });
        return;
      }

      // Get equipment with images
      const { data: equipmentData, error: equipmentImagesError } = await supabase
        .from('equipment')
        .select(`*, equipment_images!inner (id, image_url, is_main)`)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (equipmentImagesError) throw equipmentImagesError;

      setEquipment(equipmentData || []);

      // Get bookings only for the owner's equipment
      console.log('Fetching bookings for equipment IDs:', equipmentIds);
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_profiles!fk_bookings_user_profiles (user_id, full_name, email, phone),
          renter:user_profiles!fk_bookings_renter (user_id, full_name, email, phone),
          equipment:equipment!bookings_equipment_id_fkey (
            id, title, type,
            equipment_images (id, image_url, is_main)
          )
        `)
        .in('equipment_id', equipmentIds)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', {
          error: bookingsError,
          message: bookingsError.message,
          details: bookingsError.details,
          hint: bookingsError.hint,
          code: bookingsError.code,
        });
        throw bookingsError;
      }

      console.log('Successfully fetched bookings:', bookingsData);

      setBookings(bookingsData || []);
      setStats({
        totalEquipment: equipmentData?.length || 0,
        activeBookings: (bookingsData || []).filter(b => b.status === 'active').length,
        totalBookings: bookingsData?.length || 0,
      });
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };



  const updateBookingStatus = async (bookingId: string, status: 'accepted' | 'rejected'): Promise<{ success: boolean; error?: string }> => {
    console.log('Updating booking status:', bookingId, status);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Show success message
      showStatus('success', `Booking ${status} successfully!`);

      // Refresh the bookings
      await fetchDashboardData();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error updating booking status:', errorMessage);
      showStatus('error', `Failed to ${status} booking. Please try again.`);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const approveBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'accepted');
      return { success: true };
    } catch (error) {
      console.error('Error approving booking:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to approve booking' 
      };
    }
  };

  const rejectBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'rejected');
      return { success: true };
    } catch (error) {
      console.error('Error rejecting booking:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reject booking' 
      };
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('background_check_status, id_document_url, proof_of_address_url')
        .eq('user_id', user.id)
        .single();

      if (
        profile &&
        profile.background_check_status === 'pending' &&
        (!profile.id_document_url || !profile.proof_of_address_url)
      ) {
        setShowVerificationBanner(true);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleSave = (updatedEquipment: Equipment) => {
    setEquipment(prev => prev.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
    setSelectedEquipment(null);
  };

  const handleDelete = (deletedId: string) => {
    const updated = equipment.filter(e => e.id !== deletedId);
    setEquipment(updated);
    setStats(prev => ({ ...prev, totalEquipment: updated.length }));
    setSelectedEquipment(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = parseISO(booking.start_date);
    if (selectedStatus !== 'all' && booking.status !== selectedStatus) return false;
    if (startDate && endDate) {
      return isWithinInterval(bookingDate, { start: startDate, end: endDate });
    }
    if (startDate) return bookingDate.getTime() >= startDate.getTime();
    if (endDate) return bookingDate.getTime() <= endDate.getTime();
    return true;
  });

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  return {
    user,
    stats,
    error,
    isLoading,
    activeTab,
    setActiveTab,
    equipment,
    bookings: paginatedBookings,
    selectedEquipment,
    setSelectedEquipment,
    selectedBooking,
    setSelectedBooking,
    showVerificationBanner,
    showVerificationModal,
    setShowVerificationModal,
    handleSave,
    handleDelete,
    selectedStatus,
    setSelectedStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    setCurrentPage,
    totalFilteredBookings: filteredBookings.length,
    bookingsPerPage,
    approveBooking,
    rejectBooking,
    statusModal,
    setStatusModal,
    showStatus,
  };
};

export default useOwnerDashboard;
