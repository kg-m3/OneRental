@@ .. @@
 import { useMockDataStore } from '../../store/mockDataStore';
-import axios from 'axios';
 
 interface Booking {
@@ .. @@
   const [stats, setStats] = useState({
     activeBookings: 0,
     totalBookings: 0,
     pendingBookings: 0,
   });
   const [isLoading, setLoading] = useState(false);
   const [error, setError] = useState('');
-  const [paymentStatus, setPaymentStatus] = useState('');
-
-  const handleFNBPayment = async (booking: Booking) => {
-    try {
-      const response = await axios.post('/api/fnb-payment', {
-        bookingId: booking.id,
-        amount: booking.total_amount,
-        userId: booking.renter_id,
-        equipmentId: booking.equipment_id
-      });
-      window.location.href = response.data.paymentUrl;
-    } catch (error) {
-      setError('Payment processing failed. Please try again.');
-      setPaymentStatus('failed');
-    }
-  };
 
   useEffect(() => {
@@ .. @@
               <div className="flex space-x-2">
                 <button
-                  className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
-                  onClick={() => handleFNBPayment(booking)}
+                  className="px-3 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-900 hover:text-white"
+                  onClick={() => {
+                    // TODO: Navigate to /payments/checkout/:bookingId (placeholder route)
+                    alert('Payment functionality will be implemented in a separate task');
+                  }}
                 >
                   Complete Payment
                 </button>