import { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase';
import EquipmentEditor from './EquipmentEditor';
import StatsOverview from './OwnerDashboard/StatsOverview';
import EquipmentList from './OwnerDashboard/EquipmentList';
import RentalRequests from './OwnerDashboard/RentalRequests';
import BookingDetailsModal from './OwnerDashboard/BookingDetailsModal';
import StatusModal from './OwnerDashboard/StatusModal';
import VerificationModal from './VerificationModal';
import VerificationBanner from './VerificationBanner';
import Calendar from './OwnerDashboard/Calendar';
import useOwnerDashboard from './OwnerDashboard/useOwnerDashboard';

type StatusModalState = {
  isOpen: boolean;
  status: 'success' | 'error' | 'info';
  message: string;
};

// Banner status type matches your VerificationBanner variants
type VerificationStatus = 'none' | 'pending' | 'in_review' | 'approved' | 'rejected';

const OwnerDashboard = () => {
  const {
    stats,
    error,
    isLoading,
    activeTab,
    setActiveTab,
    equipment,
    bookings,
    selectedEquipment,
    setSelectedEquipment,
    selectedBooking,
    setSelectedBooking,
    showVerificationBanner,
    setShowVerificationModal,
    showVerificationModal,
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
    totalFilteredBookings,
    bookingsPerPage,
    approveBooking,
    rejectBooking,
    statusModal,
    setStatusModal
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

    } catch (error: any) {
      console.error('Verification submission failed:', error);
      setStatusModal({
        isOpen: true,
        status: 'error',
        message: error.message || 'Failed to submit verification. Please try again.'
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
        return <EquipmentList equipment={equipment} onEdit={setSelectedEquipment} />;
      case 'requests':
        return (
          <RentalRequests 
            selectedStatus={selectedStatus} 
            setSelectedStatus={setSelectedStatus} 
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
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {(showVerificationBanner || verificationStatus !== 'none') && (
        <VerificationBanner
          status={verificationStatus}                    // ← drives the banner variant
          onOpen={() => setShowVerificationModal(true)}
        />
      )}

      <StatsOverview stats={stats} />

      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex border-b">
          {['equipment', 'requests', 'calendar'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-blue-900 text-blue-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'equipment' ? 'Equipment' : tab === 'requests' ? 'Rental Requests' : 'Calendar'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">{renderTabContent()}</div>

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
