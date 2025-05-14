import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaCube, FaUsers, FaCog, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { FaPercentage } from 'react-icons/fa';

function Sidebar() {
  const getNavLinkClass = ({ isActive }) => {
    return `flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Monkey Shoes</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý cửa hàng</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Tổng quan
          </p>
          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <FaHome className="h-5 w-5 mr-3 text-gray-500" />
            Tổng quan
          </NavLink>
        </div>
        
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quản lý
          </p>
          <NavLink to="/dashboard/orders" className={getNavLinkClass}>
            <FaShoppingBag className="h-5 w-5 mr-3 text-gray-500" />
            Đơn hàng
          </NavLink>
          <NavLink to="/dashboard/products" className={getNavLinkClass}>
            <FaCube className="h-5 w-5 mr-3 text-gray-500" />
            Sản phẩm
          </NavLink>
          <NavLink to="/dashboard/customers" className={getNavLinkClass}>
            <FaUsers className="h-5 w-5 mr-3 text-gray-500" />
            Khách hàng
          </NavLink>
          <NavLink to="/dashboard/accounts" className={getNavLinkClass}>
            <FaUserShield className="h-5 w-5 mr-3 text-gray-500" />
            Tài khoản
          </NavLink>

          
          <NavLink to="/dashboard/discounts" className={getNavLinkClass}>
            <FaPercentage className="h-5 w-5 mr-3 text-gray-500" />
            Khuyến mãi
          </NavLink>
        </div>
        
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Hệ thống
          </p>
          <NavLink to="/dashboard/settings" className={getNavLinkClass}>
            <FaCog className="h-5 w-5 mr-3 text-gray-500" />
            Cài đặt
          </NavLink>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors">
          <FaSignOutAlt className="h-5 w-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Sidebar;