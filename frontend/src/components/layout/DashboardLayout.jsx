import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)] font-sans">
      
      {/* Sidebar Component */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden bg-[var(--color-bg-base)]">
        
        {/* Top Navbar Component */}
        <TopNavbar setMobileOpen={setMobileOpen} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="max-w-[1280px] mx-auto w-full px-[20px] py-[24px] md:px-[48px] md:py-[40px]">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;
