import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuthStore } from '../../store/authStore';

const AppLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Keep the sidebar mode in sync with the current viewport so desktop collapse
  // and mobile slide-in behavior can share the same toggle button.
  useEffect(() => {
    const handleResize = () => {
      const nextIsDesktop = window.innerWidth >= 768;
      setIsDesktop(nextIsDesktop);
      if (nextIsDesktop) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close the mobile sidebar when the route changes so navigation feels natural.
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setIsSidebarCollapsed((current) => !current);
      return;
    }

    setIsMobileSidebarOpen((current) => !current);
  };

  const sidebarWidthClass = isSidebarCollapsed ? 'md:w-[70px]' : 'md:w-[250px]';
  const mainOffsetClass = isSidebarCollapsed ? 'md:ml-[70px]' : 'md:ml-[250px]';

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-black overflow-hidden font-display">
      {/* The sidebar is fixed so the main content can resize independently. */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        widthClass={sidebarWidthClass}
      />

      {/* Mobile backdrop: clicking it closes the sliding sidebar. */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <main className={`flex-1 flex flex-col h-screen min-h-0 transition-[margin-left] duration-300 ease-in-out ${mainOffsetClass}`}>
        {/* The toggle button lives in the header so it is always reachable. */}
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
