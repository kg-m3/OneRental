import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { AuthProvider } from './context/authContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import FeaturedEquipment from './components/FeaturedEquipment';
import ListingCTA from './components/ListingCTA';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AllEquipment from './pages/AllEquipment';
import EquipmentDetails from './pages/EquipmentDetails';
import ListEquipment from './pages/ListEquipment';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import OwnerDashboard from './components/dashboard/OwnerDashboard';
import RenterDashboard from './components/dashboard/RenterDashboard';
import Profile from './components/Profile';

function App() {
  const { setUser, fetchUserRoles } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchUserRoles(session.user.id);
        } else if (mounted) {
          setUser(null);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_OUT') {
              setUser(null);
              return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (mounted && session?.user) {
                setUser(session.user);
                await fetchUserRoles(session.user.id);
              }
            }
          }
        );

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    }

    initializeAuth();
  }, [setUser, fetchUserRoles]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
              <About />
              <HowItWorks />
              <FeaturedEquipment />
              <ListingCTA />
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/equipment/:id" element={
             <>
             <Navbar />
             <EquipmentDetails />
             <Footer />  
             </>} />
          <Route path="/all-equipment" element={
             <>
            <Navbar />
            <AllEquipment />
            <Footer />  
            </>} />

          {/* Protected routes */}
          <Route path="/list-equipment" element={
             <>
             <Navbar />
             <ListEquipment  />
             <Footer />  
             </>} />
          <Route path="/dashboard" element={ 
            <>
            <Navbar />
            <Dashboard />
            <Footer />  
            </>} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/renter-dashboard" element={<RenterDashboard />} />
          <Route path="/profile" element={
             <>
            <Navbar />
            <Profile />
            <Footer />  
            </>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;