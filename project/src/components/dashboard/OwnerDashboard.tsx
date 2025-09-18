import { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase';
import EquipmentEditor from './EquipmentEditor';
import StatsOverview from './OwnerDashboard/StatsOverview';
import PredictiveInsights from './CRM/PredictiveInsights';
import RevenueAnalysis from './CRM/RevenueAnalysis';
// import UtilizationHeatmap from './CRM/UtilizationHeatmap';
import CustomerSegmentation from './CRM/CustomerSegmentation';
import StatsCards from './CRM/StatsCards';
import BookingStatusPie from './CRM/BookingStatusPie';
import CustomerInsights from './CRM/CustomerInsights';
import ActivityTimeline from './CRM/ActivityTimeline';
import DamageChecklist from './CRM/DamageChecklist';
import CashflowForecast from './CRM/CashflowForecast';
// import FiltersBar from './CRM/FiltersBar';
import ExportButtons from './CRM/ExportButtons';
import EquipmentList from './OwnerDashboard/EquipmentList';
import RentalRequests from './OwnerDashboard/RentalRequests';
import BookingDetailsModal from './OwnerDashboard/BookingDetailsModal';
import StatusModal from './OwnerDashboard/StatusModal';
import VerificationModal from './VerificationModal';
import VerificationBanner from './VerificationBanner';
import Calendar from './OwnerDashboard/Calendar';
import useOwnerDashboard from './OwnerDashboard/useOwnerDashboard';
import { CollapsibleCard } from './CollapsibleCard';

type StatusModalState = {
  isOpen: boolean;
  status: 'success' | 'error' | 'info';
  message: string;
};

// Banner status type matches your VerificationBanner variants
type VerificationStatus = 'none' | 'pending' | 'in_review' | 'approved' | 'rejected';

const OwnerDashboard = () => {
  const {
    // core state
    stats,
    error,
    isLoading,
    activeTab,
    setActiveTab,
    equipment,
    bookings,
    // CRM datasets
    revenueSeries,
  statusBreakdown,
  activity,
  equipmentPerf,
  topCustomers,
  rentalHoursThisMonth,
  totalRevenueAllTime,
    // selections/modals
    selectedEquipment,
    setSelectedEquipment,
    selectedBooking,
    setSelectedBooking,
    showVerificationBanner,
    setShowVerificationModal,
    showVerificationModal,
    // actions
    handleSave,
    handleDelete,
    approveBooking,
    rejectBooking,
  deliverBooking,
  completeBooking,
    // filters/pagination
    selectedStatus,
    setSelectedStatus,
  searchQuery,
  setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    setCurrentPage,
    totalFilteredBookings,
    bookingsPerPage,
    // status toast/modal
    statusModal,
    setStatusModal,
  } = useOwnerDashboard();

  // 🔹 Local status to control which banner variant shows
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('none');

  const handleVerificationSubmit = useCallback(async ({
    files,
    extras
  }: {
    files: Record<string, File | null>;
    extras: { agree: boolean; notes?: string; company_reg_number?: string };
  }) => {
    try {
      if (!extras.agree) {
        throw new Error('You must agree to the terms');
      }

      // 1) Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('User not authenticated');
      const userId = session.user.id;

      // 2) Upload files
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      const uploadPromises = Object.entries(files)
        .filter(([_, file]) => file !== null)
        .map(async ([key, file]) => {
          if (!file) return null;

          const fileExt = file.name.split('.').pop()?.toLowerCase();
          if (!fileExt || !allowedExtensions.includes(`.${fileExt}`)) {
            throw new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} are allowed.`);
          }

          const fileName = `${key}_${Date.now()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          const { error: uploadError } = await supabase
            .storage
            .from('verification-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Optional: if your bucket is public; if private, you’ll create signed URLs when viewing
          const { data: { publicUrl } } = supabase
            .storage
            .from('verification-documents')
            .getPublicUrl(filePath);

          return {
            type: key,           // e.g., "id_doc" | "proof_address"
            path: filePath,
            url: publicUrl,
            name: file.name,
            size: file.size,
            mime_type: file.type
          };
        });

      const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean);

      // 3) Save verification record (adjust to your schema as needed)
      const { data: verification, error } = await supabase
        .from('verifications')
        .insert([{
          user_id: userId,
          status: 'pending',
          documents: uploadedFiles, // if you use a separate verification_documents table, insert there instead
          notes: extras.notes,
          company_reg_number: extras.company_reg_number,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save verification record. Please try again.');
      }
      if (!verification) {
        throw new Error('No verification data returned from server');
      }

      // 4) UI: success + show “under review” banner
      setStatusModal({
        isOpen: true,
        status: 'success',
        message: 'Verification submitted successfully! We will review your documents shortly.'
      });

      // ⬅️ key change: reflect “pending” state in the banner
      setVerificationStatus('pending');

      // Close modal after a short delay (modal also has its own success screen if you prefer)
      setTimeout(() => {
        setShowVerificationModal(false);
      }, 1200);
    } catch (e: any) {
      setStatusModal({
        isOpen: true,
        status: 'error',
        message: e?.message || 'Failed to submit verification. Please try again.'
      });
    }
  }, [setShowVerificationModal, setStatusModal]);

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
            <EquipmentList equipment={equipment} onEdit={setSelectedEquipment} equipmentPerf={equipmentPerf} />
            <CollapsibleCard id="damage-checklist" title="Damage Checklist" subtitle="Pre/Post rental inspection" defaultOpen={false}>
              <DamageChecklist />
            </CollapsibleCard>
            
          </div>
        );
      case 'requests':
        return (
          <RentalRequests 
            selectedStatus={selectedStatus} 
            setSelectedStatus={setSelectedStatus} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startDate={startDate} 
            setStartDate={setStartDate} 
            endDate={endDate} 
            setEndDate={setEndDate} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            totalFilteredBookings={totalFilteredBookings} 
            bookingsPerPage={bookingsPerPage} 
            bookings={bookings} 
            onSelectBooking={setSelectedBooking}
            approveBooking={approveBooking}
            rejectBooking={rejectBooking}
          />
        );
      case 'calendar':
        return <Calendar equipment={equipment} />;
      case 'stats':
        return (
          <div className="space-y-6">
            <StatsCards stats={{
              totalActiveEquipment: stats.totalEquipment,
              pendingRequests: bookings.filter(b => b.status === 'pending').length,
              confirmedThisMonth: bookings.filter(b => ['accepted','active','delivered','returned','completed','paid'].includes(b.status)).length,
              revenueThisMonth: revenueSeries[revenueSeries.length-1]?.revenue || 0,
              revenueLastMonth: revenueSeries[revenueSeries.length-2]?.revenue || 0,
              rentalHoursThisMonth,
              totalRevenueAllTime,
            }} />
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <CollapsibleCard
                  id="smart-insights"
                  title="Smart Insights"
                  subtitle="AI-powered recommendations based on your data"
                  defaultOpen
                  summary={<ul className="text-sm list-disc pl-4"><li>Price +12% on Excavator XL2000</li><li>Maintenance due for Bulldozer D8T</li></ul>}
                >
                  <PredictiveInsights equipment={equipment} bookings={bookings} isLoading={isLoading} bare />
                </CollapsibleCard>
              </div>

              <div className="col-span-12 lg:col-span-6 xl:col-span-8">
                <CollapsibleCard
                  id="revenue-analysis"
                  title="Revenue Analysis"
                  subtitle="Monthly revenue and profit trends"
                  defaultOpen
                  summary={<div className="flex items-center justify-between"><span className="text-sm">MTD: R{(revenueSeries[revenueSeries.length-1]?.revenue || 0).toLocaleString()}</span><span className="text-xs text-zinc-500">Last 30 days</span></div>}
                >
                  <RevenueAnalysis data={revenueSeries.map(r => ({ month: r.month, revenue: r.revenue, profit: r.revenue * 0.3 }))} isLoading={isLoading} bare height={256} />
                </CollapsibleCard>
              </div>

              <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                <CollapsibleCard id="booking-status" title="Booking Statuses" defaultOpen summary={<div className="text-sm">Pending {bookings.filter(b=>b.status==='pending').length} · Active {bookings.filter(b=>b.status==='active').length}</div>}>
                  <BookingStatusPie data={statusBreakdown} bare height={256} />
                </CollapsibleCard>
              </div>

              {/* <div className="col-span-12 lg:col-span-6 xl:col-span-6">
                <CollapsibleCard id="utilization-heatmap" title="Utilization Heatmap" subtitle="Usage patterns" defaultOpen>
                  <UtilizationHeatmap data={equipment.map(eq => ({ equipment: eq.title, days: Array.from({length: 30}, () => Math.random()) }))} isLoading={isLoading} bare />
                </CollapsibleCard>
              </div> */}
              <div className="col-span-12 lg:col-span-6 xl:col-span-6">
                <CollapsibleCard id="cashflow" title="Cashflow Forecast" subtitle="Projection based on recent revenue" defaultOpen={false}>
                  <CashflowForecast history={revenueSeries} bare />
                </CollapsibleCard>
              </div>

              <div className="col-span-12 lg:col-span-6 xl:col-span-6">
                <CollapsibleCard id="customer-segmentation" title="Customer Segmentation" subtitle="Top value cohorts" defaultOpen summary={<div className="flex gap-2 text-xs"><span className="px-2 py-0.5 bg-zinc-100 rounded">Top 10%</span><span className="px-2 py-0.5 bg-zinc-100 rounded">Frequent</span><span className="px-2 py-0.5 bg-zinc-100 rounded">One-time</span></div>}>
                  <CustomerSegmentation data={[{ segment: 'Top 10%', count: 12, revenue: 50000 }, { segment: 'Frequent', count: 30, revenue: 32000 }, { segment: 'One-time', count: 80, revenue: 15000 }]} isLoading={isLoading} bare />
                </CollapsibleCard>
              </div>

              <div className="col-span-12">
                <CollapsibleCard id="activity" title="Recent Activity" defaultOpen>
                  <ActivityTimeline items={activity} />
                </CollapsibleCard>
              </div>
            </div>
            <div className="flex justify-end">
              <ExportButtons onExportCsv={() => {
                const rows = [['month','revenue'], ...revenueSeries.map(r => [r.month, String(r.revenue)])];
                const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'onerental-stats.csv'; a.click(); URL.revokeObjectURL(url);
              }} filename="onerental-stats" />
            </div>
          </div>
        );
      case 'customers':
        return (
          <div className="space-y-6">
            <CustomerInsights customers={topCustomers} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
  <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-[1800px] px-4 md:px-6 xl:px-8 py-6 md:py-8">
      {(showVerificationBanner || verificationStatus !== 'none') && (
        <VerificationBanner
          status={verificationStatus}                    // ← drives the banner variant
          onOpen={() => setShowVerificationModal(true)}
        />
      )}

      <StatsOverview
        stats={stats}
        onEquipmentClick={() => setActiveTab('equipment')}
        onActiveBookingsClick={() => setActiveTab('requests')}
  onTotalBookingsClick={() => setActiveTab('stats')}
      />

  <div className="bg-white rounded-lg shadow-sm mb-6 md:mb-8">
        <div className="flex border-b">
  {['stats','customers','equipment','requests','calendar'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-blue-900 text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
  {tab === 'stats' ? 'Statistics' : tab === 'customers' ? 'Customers' : tab === 'equipment' ? 'Equipment' : tab === 'requests' ? 'Rental Requests' : 'Calendar'}
            </button>
          ))}
        </div>
      </div>

  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">{renderTabContent()}</div>

      {selectedEquipment && (
        <EquipmentEditor
          selectedEquipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={approveBooking}
          onReject={rejectBooking}
          onDeliver={deliverBooking}
          onComplete={completeBooking}
        />
      )}

      {showVerificationModal && (
        <VerificationModal 
          onClose={() => setShowVerificationModal(false)}
          onSubmit={handleVerificationSubmit}
        />
      )}
      
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev: StatusModalState) => ({ ...prev, isOpen: false }))}
        status={statusModal.status}
        message={statusModal.message}
        duration={3000}
      />
    </div>
  );
};

export default OwnerDashboard;
