import React from 'react';
// Import React Icons
import { FaShoppingBag, FaDollarSign, FaCube, FaUsers } from 'react-icons/fa'; 

function OverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Xem tổng quan về hoạt động kinh doanh của bạn</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              {/* Replace SVG with FaShoppingBag */}
              <FaShoppingBag className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Đơn hàng</h2>
              <p className="font-bold text-2xl text-gray-800">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Hôm nay</span>
              <span className="text-xs font-medium text-green-600">+0%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              {/* Replace SVG with FaDollarSign */}
              <FaDollarSign className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Doanh thu</h2>
              <p className="font-bold text-2xl text-gray-800">0₫</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tháng này</span>
              <span className="text-xs font-medium text-green-600">+0%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              {/* Replace SVG with FaCube */}
              <FaCube className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Sản phẩm</h2>
              <p className="font-bold text-2xl text-gray-800">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tổng số</span>
              <span className="text-xs font-medium text-blue-600">Xem tất cả</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600">
              {/* Replace SVG with FaUsers */}
              <FaUsers className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Khách hàng</h2>
              <p className="font-bold text-2xl text-gray-800">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tổng số</span>
              <span className="text-xs font-medium text-blue-600">Xem tất cả</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Doanh thu gần đây</h3>
          </div>
          <div className="p-6 flex items-center justify-center h-64">
            <p className="text-gray-500">Chưa có dữ liệu doanh thu</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Đơn hàng gần đây</h3>
          </div>
          <div className="p-6 flex items-center justify-center h-64">
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;