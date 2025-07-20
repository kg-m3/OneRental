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
  const [error, setError] = useState<String | null>(null);
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
      const [equipmentRes, bookingsRes] = await Promise.all([
        supabase
          .from('equipment')
          .select(`*, equipment_images!inner (id, image_url, is_main)`) // join images
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('bookings')
          .select(`
            *,
            user_profiles!inner (full_name, email, phone),
            equipment!inner (title, type, equipment_images (id, image_url, is_main))
          `)
          .order('created_at', { ascending: false })
      ]);

      const equipmentData = equipmentRes.data || [];
      const bookingsData = bookingsRes.data || [];

      setEquipment(equipmentData);
      setBookings(bookingsData);
      setStats({
        totalEquipment: equipmentData.length,
        activeBookings: bookingsData.filter(b => b.status === 'active').length,
        totalBookings: bookingsData.length
      });
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
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
    setShowVerificationBanner,
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
    bookingsPerPage
  };
};

export default useOwnerDashboard;
