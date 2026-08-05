import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsDesktopExpanded(!isDesktopExpanded);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        isDesktopExpanded={isDesktopExpanded}
        onToggle={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};