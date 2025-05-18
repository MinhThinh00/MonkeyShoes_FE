import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from'react-router-dom';
import { fetchStores } from'../helper/productApi'; 
import { getOrderByFilter, getOrderByStoreId } from'../helper/orderHelper';
import { FaPlus, FaSearch, FaShoppingBag, FaClock, FaCheckCircle, FaTruck } from 'react-icons/fa'; // Added more icons
import OrderDetailDialog from '../components/OrderDetailDialog';

function OrdersPage() {

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(1);
  const [orders, setOrders] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    shipped: 0
  });
  
  // Add these state variables for date filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Add a flag to track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.token) {
          const storesData = await fetchStores(currentUser.token);
          setStores(storesData);
          
          // Use the initial fetch function without filters
          await fetchInitialOrders(selectedStore);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Initial fetch without filters
  const fetchInitialOrders = async (storeId, page = 0) => {
    try {
      if (currentUser?.token) {
        console.log(`Initial fetch - Store: ${storeId}, Page: ${page}`);
        
        const response = await getOrderByStoreId(storeId, currentUser.token, page);
        
        if (response && response.data && response.data.data) {
          setOrders(response.data.data.orders || []);
          setPagination({
            currentPage: response.data.data.currentPage,
            totalPages: response.data.data.totalPages,
            totalItems: response.data.data.totalItems
          });
        }
      }
    } catch (error) {
      console.error('Error fetching initial orders:', error);
    }
  };

  // Add useEffect for debounced filtering - only when filters change
  useEffect(() => {
    // Skip the first render
    if (!filtersApplied) {
      setFiltersApplied(true);
      return;
    }
    
    const timer = setTimeout(() => {
      fetchOrdersWithFilters(selectedStore, 0);
    }, 500); // 500ms debounce
  
    return () => clearTimeout(timer);
  }, [startDate, endDate, statusFilter]);
  
  // Separate effect for store changes
  useEffect(() => {
    // Skip the first render
    if (!filtersApplied) {
      return;
    }
    
    // If filters have been applied, use filtered fetch
    if (startDate || endDate !== new Date().toISOString().split('T')[0] || statusFilter !== 'ALL') {
      fetchOrdersWithFilters(selectedStore, 0);
    } else {
      // Otherwise use initial fetch
      fetchInitialOrders(selectedStore, 0);
    }
  }, [selectedStore]);
  
  // Fetch with filters
  const fetchOrdersWithFilters = async (storeId, page = 0) => {
    try {
      if (currentUser?.token) {
        console.log(`Filtered fetch - Store: ${storeId}, Page: ${page}, StartDate: ${startDate}, EndDate: ${endDate}, Status: ${statusFilter !== 'ALL' ? statusFilter : ''}`);
        
        const response = await getOrderByFilter(
          storeId, 
          currentUser.token, 
          page,
          startDate,
          endDate,
          statusFilter !== 'ALL' ? statusFilter : ''
        );
        
        if (response && response.data && response.data.data) {
          setOrders(response.data.data.orders || []);
          setPagination({
            currentPage: response.data.data.currentPage,
            totalPages: response.data.data.totalPages,
            totalItems: response.data.data.totalItems
          });
        }
      }
    } catch (error) {
      console.error('Error fetching filtered orders:', error);
    }
  };

  // Handler for status filter
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Update handleStoreChange
  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    setSelectedStore(storeId);
    
    // Use appropriate fetch based on filter state
    if (startDate || endDate !== new Date().toISOString().split('T')[0] || statusFilter !== 'ALL') {
      fetchOrdersWithFilters(storeId, 0);
    } else {
      fetchInitialOrders(storeId, 0);
    }
  };

  // Update handlePageChange
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      // Use appropriate fetch based on filter state
      if (startDate || endDate !== new Date().toISOString().split('T')[0] || statusFilter !== 'ALL') {
        fetchOrdersWithFilters(selectedStore, newPage);
      } else {
        fetchInitialOrders(selectedStore, newPage);
      }
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
  };
  
  const handleCloseDialog = () => {
    setSelectedOrderId(null);
  };
  
  const handleOrderStatusUpdate = (orderId, newStatus) => {
    // Update the order status in the orders list
    setOrders(orders.map(order => 
      order.id === orderId ? {...order, status: newStatus} : order
    ));
  };

  useEffect(() => {
    // Calculate order statistics whenever orders change
    if (orders.length > 0) {
      const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'PENDING').length,
        completed: orders.filter(order => order.status === 'COMPLETED').length,
        shipped: orders.filter(order => order.status === 'SHIPPED').length
      };
      setOrderStats(stats);
    }
  }, [orders]);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả đơn hàng</p>
        </div>
        {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <FaPlus className="h-5 w-5 mr-2" />
          Tạo đơn hàng
        </button> */}
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tổng đơn hàng</h3>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <FaShoppingBag className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{pagination.totalItems}</p>
          <p className="text-sm text-gray-500 mt-1">Đơn hàng</p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Chờ xác nhận</h3>
            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-full">
              <FaClock className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{orderStats.pending}</p>
          <p className="text-sm text-gray-500 mt-1">Đơn hàng</p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Đã giao cho shipper</h3>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
              <FaTruck className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{orderStats.shipped}</p>
          <p className="text-sm text-gray-500 mt-1">Đơn hàng</p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Hoàn thành</h3>
            <span className="p-2 bg-green-50 text-green-600 rounded-full">
              <FaCheckCircle className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{orderStats.completed}</p>
          <p className="text-sm text-gray-500 mt-1">Đơn hàng</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Danh sách đơn hàng</h3>
          <div className="flex space-x-2">
            <select 
              value={selectedStore}
              onChange={handleStoreChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            
            {/* Date filters with auto-update */}
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="flex items-center text-gray-500">đến</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select 
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ Xác Nhận</option>
              <option value="PROCESSING">Đang Xử Lý</option>
              <option value="SHIPPED">Đã Giao Hàng Cho Shipper</option>
              <option value="COMPLETED">Hoàn Thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản Phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức thanh toán
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        {order.items && order.items.length > 0 && (
                          <>
                            <img 
                              src={order.items[0].variant.img} 
                              alt={order.items[0].variant.name}
                              className="h-12 w-12 object-cover rounded-md mr-3"
                            />
                            <div className="text-sm text-gray-900">
                              {order.items.map((item, index) => (
                                <div key={item.id} className={index !== 0 ? "mt-1" : ""}>
                                  {item.variant.productName} <br />
                                  {item.variant.name} x {item.quantity}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(order.totalPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.payment && (
                        <div className="text-sm text-gray-900">
                          {order.payment.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                           order.payment.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 
                           order.payment.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 
                           order.payment.paymentMethod}/{order.payment.status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {order.status === 'PENDING' ? 'Chờ Xác Nhận' : 
                         order.status === 'COMPLETED' ? 'Hoàn thành' : 
                         order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleOrderClick(order.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="6" className="px-6 py-12 text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {orders.length} / {pagination.totalItems} đơn hàng
          </p>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50" 
              disabled={pagination.currentPage === 0}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Trước
            </button>
            <button 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50" 
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
      
      {/* Order Detail Dialog */}
      {selectedOrderId && (
        <OrderDetailDialog 
          orderId={selectedOrderId}
          token={currentUser?.token}
          onClose={handleCloseDialog}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </div>
  );
}

export default OrdersPage;