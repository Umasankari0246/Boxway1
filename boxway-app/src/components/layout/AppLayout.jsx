import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuthStore } from '../../store/authStore';

const AppLayout = () => {
  const { user } = useAuthStore();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-black overflow-hidden font-display">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen min-h-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
