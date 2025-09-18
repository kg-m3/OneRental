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
  location?: string;
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
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type StatusModalState = {
    isOpen: boolean;
    status: 'success' | 'error' | 'info';
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

  // CRM datasets
  const [revenueSeries, setRevenueSeries] = useState<{ month: string; revenue: number }[]>([]);
  const [topEquipment, setTopEquipment] = useState<{ name: string; value: number }[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [customerSources, setCustomerSources] = useState<{ name: string; value: number }[]>([]);
  const [topCustomers, setTopCustomers] = useState<{ id: string; name: string; email: string; totalBookings: number; totalRevenue: number; lastActive: string; contacted?: boolean }[]>([]);
  const [equipmentPerf, setEquipmentPerf] = useState<{ id: string; name: string; utilization: number; maintenanceDue?: string | null; status: 'ok' | 'maintenance' | 'idle'; }[]>([]);
  const [activity, setActivity] = useState<{ id: string; type: 'booking' | 'payment' | 'equipment'; message: string; date: string }[]>([]);
  const [rentalHoursThisMonth, setRentalHoursThisMonth] = useState<number>(0);
  const [totalRevenueAllTime, setTotalRevenueAllTime] = useState<number>(0);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
          equipment:equipment!bookings_equipment_id_fkey (
            id, title, type, location,
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

      const allBookings = bookingsData || [];
      setBookings(allBookings);
      setStats({
        totalEquipment: equipmentData?.length || 0,
        // Treat delivered as active (equipment is out with renter)
        activeBookings: allBookings.filter(b => ['active','delivered'].includes(b.status)).length,
        totalBookings: allBookings.length || 0,
      });

  // Build revenue series (last 12 months)
      const now = new Date();
      const series: { month: string; revenue: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthRevenue = allBookings
          .filter(b => {
            const bd = new Date(b.created_at);
            return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth() && ['accepted','active','completed','paid'].includes(b.status);
          })
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        series.push({ month: key, revenue: monthRevenue });
      }
      setRevenueSeries(series);

  // Total revenue (all time) for accepted/active/delivered/completed/paid/returned
  const goodStatuses = new Set(['accepted','active','delivered','completed','paid','returned']);
      const revenueAll = allBookings
        .filter(b => goodStatuses.has(b.status))
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      setTotalRevenueAllTime(revenueAll);

  // Total rental hours this month (overlap within current month, accepted/active/delivered/completed/paid/returned)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const HOUR_MS = 1000 * 60 * 60;
  const inGoodStatus = (s: string) => ['accepted','active','delivered','completed','paid','returned'].includes(s);
      const hoursOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
        const start = aStart > bStart ? aStart : bStart;
        const end = aEnd < bEnd ? aEnd : bEnd;
        const diff = end.getTime() - start.getTime();
        return Math.max(0, Math.ceil(diff / HOUR_MS));
      };
      const totalHours = allBookings.reduce((sum, b) => {
        if (!inGoodStatus(b.status)) return sum;
        const sd = new Date(b.start_date);
        const ed = new Date(b.end_date);
        return sum + hoursOverlap(sd, ed, monthStart, monthEnd);
      }, 0);
      setRentalHoursThisMonth(totalHours);

      // Top equipment by bookings count
      const equipmentCounts: Record<string, number> = {};
      allBookings.forEach(b => { equipmentCounts[b.equipment_id] = (equipmentCounts[b.equipment_id] || 0) + 1; });
      const top = Object.entries(equipmentCounts)
        .map(([id, count]) => ({ name: equipmentData?.find(e => e.id === id)?.title || id, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      setTopEquipment(top);

  // Status breakdown (include broader set for visibility)
      const statusCounts: Record<string, number> = {};
      allBookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });
  const statuses = ['pending','accepted','active','delivered','returned','completed','paid','cancelled','rejected'];
      setStatusBreakdown(statuses.map(s => ({ name: s, value: statusCounts[s] || 0 })));

      // Customer source breakdown (placeholder based on emails)
      const sources: Record<string, number> = {};
      allBookings.forEach(b => {
        const email = b.user_profiles?.email || b.user_email || '';
        const domain = email.split('@')[1] || 'direct';
        const key = domain.includes('gmail') || domain.includes('yahoo') ? 'direct' : 'referral';
        sources[key] = (sources[key] || 0) + 1;
      });
      const repeatMap: Record<string, number> = {};
      allBookings.forEach(b => { repeatMap[b.user_id] = (repeatMap[b.user_id] || 0) + 1; });
      const repeat = Object.values(repeatMap).filter(v => v > 1).length;
      setCustomerSources([
        { name: 'direct', value: sources['direct'] || 0 },
        { name: 'referral', value: sources['referral'] || 0 },
        { name: 'repeat', value: repeat },
      ]);

      // Top customers
      const customerAgg: Record<string, { id: string; name: string; email: string; totalBookings: number; totalRevenue: number; lastActive: string }> = {};
      allBookings.forEach(b => {
        const id = b.user_id;
        const name = b.user_profiles?.full_name || b.user_email || 'Customer';
        const email = b.user_profiles?.email || b.user_email || '';
        const existed = customerAgg[id];
        const lastActive = b.created_at;
        if (!existed) {
          customerAgg[id] = { id, name, email, totalBookings: 1, totalRevenue: b.total_amount || 0, lastActive };
        } else {
          existed.totalBookings += 1;
          existed.totalRevenue += (b.total_amount || 0);
          if (new Date(lastActive) > new Date(existed.lastActive)) existed.lastActive = lastActive;
        }
      });
      setTopCustomers(Object.values(customerAgg).sort((a,b) => b.totalRevenue - a.totalRevenue).slice(0, 10));

      // Booking risk scoring (simple heuristic)
      const nowTs = Date.now();
      const annotatedBookings = allBookings.map((b) => {
        const reasons: string[] = [];
        let score = 50;
        // New vs repeat
        const repeatCount = repeatMap[b.user_id] || 0;
        if (repeatCount <= 1) { score += 10; reasons.push('New customer'); } else { score -= 10; reasons.push('Repeat customer'); }
        // Amount
        const amt = b.total_amount || 0;
        if (amt > 100000) { score += 20; reasons.push('High value booking'); }
        else if (amt > 50000) { score += 12; reasons.push('Medium value booking'); }
        // Duration
        const sd = new Date(b.start_date).getTime();
        const ed = new Date(b.end_date).getTime();
        const days = Math.max(1, Math.round((ed - sd) / (1000*60*60*24)));
        if (days > 21) { score += 12; reasons.push('Long duration'); }
        else if (days > 10) { score += 6; reasons.push('Medium duration'); }
        // Lead time (last-minute)
        const created = new Date(b.created_at).getTime();
        const leadDays = Math.max(0, Math.round((sd - created) / (1000*60*60*24)));
        if (leadDays <= 2) { score += 8; reasons.push('Last-minute booking'); }
        // Age since created (brand new)
        const ageDays = Math.max(0, Math.round((nowTs - created) / (1000*60*60*24)));
        if (ageDays <= 1) { score += 4; reasons.push('Very new request'); }
        // Clamp + level
        score = Math.max(0, Math.min(100, score));
        const level = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
        return { ...b, risk: { score, level, reasons } } as typeof b & { risk: { score: number; level: 'low'|'medium'|'high'; reasons: string[] } };
      });
      // use annotated bookings
      setBookings(annotatedBookings);

      // Equipment performance (simple utilization proxy)
      const perf = (equipmentData || []).map(e => {
        const eqBookings = allBookings.filter(b => b.equipment_id === e.id);
        const daysBooked = eqBookings.reduce((sum, b) => {
          const sd = new Date(b.start_date); const ed = new Date(b.end_date);
          return sum + Math.max(0, (ed.getTime() - sd.getTime()) / (1000*60*60*24));
        }, 0);
        const daysAvailable = 30; // placeholder window
        const utilization = Math.min(1, daysBooked / daysAvailable);
        return { id: e.id, name: e.title, utilization, maintenanceDue: null, status: utilization < 0.15 ? 'idle' : 'ok' } as const;
      });
      setEquipmentPerf(perf);

      // Activity timeline
  setActivity(annotatedBookings.slice(0, 20).map(b => ({ id: b.id, type: 'booking', message: `Booking ${b.status} for ${b.equipment?.title || b.equipment_id}`, date: b.created_at })));
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };



  const updateBookingStatus = async (
    bookingId: string,
    status: 'accepted' | 'rejected' | 'delivered' | 'completed'
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('Updating booking status:', bookingId, status);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

  // Show success message
  const pastTense = status === 'accepted' ? 'accepted' :
           status === 'rejected' ? 'rejected' :
           status === 'delivered' ? 'marked as delivered' :
           status === 'completed' ? 'completed' : status;
  showStatus('success', `Booking ${pastTense}!`);

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

  const deliverBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'delivered');
      return { success: true };
    } catch (error) {
      console.error('Error marking booking delivered:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark delivered'
      };
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'completed');
      return { success: true };
    } catch (error) {
      console.error('Error completing booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete booking'
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
    if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.length) {
        const u: any = (booking as any).user || booking.user_profiles || {};
        const renterName = (u.full_name?.toLowerCase?.() || '') as string;
        const renterEmail = (u.email?.toLowerCase?.() || booking.user_email?.toLowerCase?.() || '') as string;
        const eqTitle = booking.equipment?.title?.toLowerCase?.() || '';
        const eqType = booking.equipment?.type?.toLowerCase?.() || '';
        const eqLocation = booking.equipment?.location?.toLowerCase?.() || '';
        const status = booking.status?.toLowerCase?.() || '';
        const haystack = `${renterName} ${renterEmail} ${eqTitle} ${eqType} ${eqLocation} ${status}`;
        const ok = tokens.every(t => haystack.includes(t));
        if (!ok) return false;
      }
    }
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
  revenueSeries,
  topEquipment,
  statusBreakdown,
  customerSources,
  topCustomers,
  equipmentPerf,
  activity,
  rentalHoursThisMonth,
  totalRevenueAllTime,
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
  searchQuery,
  setSearchQuery,
    approveBooking,
    rejectBooking,
  deliverBooking,
  completeBooking,
    statusModal,
    setStatusModal,
    showStatus,
  };
};

export default useOwnerDashboard;
