import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaSearch, FaBell, FaBars } from 'react-icons/fa';
import { useSelector } from 'react-redux';


function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        <div className={`h-full ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          <Sidebar />
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 mr-4 focus:outline-none"
              >
                <FaBars className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Monkey Shoes Admin</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </span>
                <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none">
                <FaBell className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;