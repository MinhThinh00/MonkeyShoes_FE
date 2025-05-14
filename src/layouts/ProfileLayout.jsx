import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaBell, FaBars, FaUser, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa';
import Header from '../components/Header/Header';

function ProfileLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const currentUser = useSelector(state => state.user.currentUser);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-md`}>
          <div className={`h-full ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-6"> 
              <nav className="space-y-2">
                <Link
                  to="/profile"
                  className={`block w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname.includes('/orders') 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaShoppingBag className="flex-shrink-0" />
                  <span>Đơn hàng của tôi</span>
                </Link>
                
                <Link
                  to="/profile/information"
                  className={`block w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname.includes('/settings') 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaUser className="flex-shrink-0" />
                  <span>Thông tin cá nhân</span>
                </Link>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FaSignOutAlt className="flex-shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProfileLayout;