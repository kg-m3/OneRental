import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import OwnerDashboard from './dashboard/OwnerDashboard';
import RenterDashboard from './dashboard/RenterDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRoles, fetchUserRoles } = useAuthStore();
  const [activeRole, setActiveRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const initializeDashboard = async () => {
      if (user && (!userRoles || userRoles.length === 0)) {
        await fetchUserRoles(user.id);
      }
      
      if (userRoles && userRoles.length > 0 && !activeRole) {
        setActiveRole(userRoles[0]);
      }
    };

    initializeDashboard();
  }, [user, userRoles, activeRole, navigate, fetchUserRoles]);

  if (!user || !activeRole) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {userRoles.length > 1 && (
        <div className="container mx-auto px-4 mb-8">
          <div className="flex justify-center space-x-4 mt-8">
            {userRoles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeRole === role
                    ? 'bg-blue-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-blue-50'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
              </button>
            ))}
          </div>
        </div>
      )}
      {activeRole === 'owner' ? <OwnerDashboard /> : <RenterDashboard />}
    </div>
  );
}

export default Dashboard