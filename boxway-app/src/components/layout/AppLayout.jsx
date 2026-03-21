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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        {/* The current route's page content renders inside Outlet */}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
