import EquipmentEditor from './EquipmentEditor';
import StatsOverview from './OwnerDashboard/StatsOverview';
import EquipmentList from './OwnerDashboard/EquipmentList';
import RentalRequests from './OwnerDashboard/RentalRequests';
import BookingDetailsModal from './OwnerDashboard/BookingDetailsModal';
import StatusModal from './OwnerDashboard/StatusModal';
import VerificationModal from './OwnerDashboard/VerificationModal';
import VerificationBanner from './OwnerDashboard/VerificationBanner';
import Calendar from './OwnerDashboard/Calendar';
import useOwnerDashboard from './OwnerDashboard/useOwnerDashboard';

type StatusModalState = {
  isOpen: boolean;
  status: 'success' | 'error';
  message: string;
};

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
      {showVerificationBanner && <VerificationBanner onOpen={() => setShowVerificationModal(true)} />}
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

      {showVerificationModal && <VerificationModal onClose={() => setShowVerificationModal(false)} />}
      
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
