import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const UserDetailDialog = ({ user, onClose, token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_URI;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) return;
      
      setLoading(true);
      try {
        // Updated API endpoint with pagination parameter
        const response = await fetch(`${baseURL}/orders/user/getall/${user.id}?page=0`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Ensure orders is always an array
          const ordersData = result.data?.orders || result.data || [];
          // Check if ordersData is an array, if not, convert it or use empty array
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } else {
          console.error('Error fetching user orders:', result.message);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, baseURL]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate status
  const translateStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPED':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Add this function to calculate total spent
  const calculateTotalSpent = () => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;
    
    // Use reduce to sum up all order totals
    // Only count orders that are DELIVERED (completed)
    return orders.reduce((total, order) => {
      // Only add to total if order is delivered
      if (order.status?.toUpperCase() === 'COMPLETED') {
        return total + (order.totalPrice || 0);
      }
      return total;
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!user) return null;

  // Calculate total spent
  const totalSpent = calculateTotalSpent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Thông tin khách hàng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Thông tin cơ bản</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">ID:</span> #{user.id}</p>
                <p><span className="font-medium">Tên người dùng:</span> {user.userName}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Tổng Tiền Đã Mua:</span> <span className="text-green-600 font-semibold">{formatCurrency(totalSpent)}</span></p>
                <p><span className="font-medium">Tổng số đơn hàng:</span> <span className="text-blue-600 font-semibold">{orders.length}</span></p>
                <p><span className="font-medium">Đơn hàng thành công:</span> <span className="text-green-600 font-semibold">{orders.filter(order => order.status?.toUpperCase() === 'COMPLETED').length}</span></p>
                <p><span className="font-medium">Đơn hàng đang giao:</span> <span className="text-purple-600 font-semibold">{orders.filter(order => order.status?.toUpperCase() === 'SHIPPED').length}</span></p>
                <p><span className="font-medium">Đơn hàng chờ xác nhận:</span> <span className="text-yellow-600 font-semibold">{orders.filter(order => order.status?.toUpperCase() === 'PENDING').length}</span></p>
                {/* <p>
                  <span className="font-medium">Trạng thái:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </p> */}
                <p><span className="font-medium">Ngày tạo:</span> {formatDate(user.createAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Thông tin liên hệ</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Số điện thoại:</span> {user.phone || 'Chưa cập nhật'}</p>
                <p><span className="font-medium">Địa chỉ:</span> {user.address || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order History Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Lịch sử đơn hàng</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !Array.isArray(orders) || orders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Khách hàng chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailDialog;