import React, { useState, useEffect } from 'react';
import { getOrderById, updateOrderStatus } from '../helper/orderHelper';
import { FaTimes, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

function OrderDetailDialog({ orderId, token, onClose, onStatusUpdate }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        if (token) {
          const response = await getOrderById(orderId, token);
          console.log('Order details:', response);
          if (response && response.data.data) {
            setOrder(response.data.data);
            setNewStatus(response.data.status);
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, token]);
  
  const handleStatusChange = async () => {
    try {
      setUpdating(true);
      if (token) {
        const response = await updateOrderStatus(orderId, newStatus, token);
        if (response && response.data) {
          setOrder({...order, status: newStatus});
          if (onStatusUpdate) {
            onStatusUpdate(orderId, newStatus);
          }
          toast.success('Cập nhật trạng thái đơn hàng thành công!');
          onClose(); // Close the dialog after successful update
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setUpdating(false);
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Lỗi</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Không tìm thấy</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Không tìm thấy!</strong>
            <span className="block sm:inline"> Không tìm thấy thông tin đơn hàng.</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Chi tiết đơn hàng #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Thông tin đơn hàng</h3>
              {order.status !== 'COMPLETED' && (
                <div className="flex items-center space-x-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    <option value="PENDING">Chờ Xác Nhận</option>
                    <option value="PROCESSING">Đang Xử Lý</option>
                    <option value="SHIPPED">Chờ Giao Hàng</option>
                    <option value="COMPLETED">Hoàn Thành</option>
                    <option value="CANCELLED">Hủy Đơn Hàng</option>
                  </select>
                  <button 
                    onClick={handleStatusChange}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                    disabled={updating || newStatus === order.status}
                  >
                    <FaSave className="h-4 w-4 mr-1" />
                    Lưu
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                <p className="text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="text-gray-900 font-semibold">{formatCurrency(order.totalPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng</p>
                <p className="text-gray-900">{order.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                <p className="text-gray-900">
                  {order.payment?.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                   order.payment?.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 
                   order.payment?.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 
                   order.payment?.paymentMethod}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Sản phẩm</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items && order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <img 
                              src={item.variant.img} 
                              alt={item.variant.name}
                              className="h-12 w-12 object-cover rounded-md mr-2"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.variant.productName || 'Sản phẩm'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.variant.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Customer and Shipping Info */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Thông tin khách hàng</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Tên khách hàng</p>
                  <p className="text-gray-900">{order.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{order.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="text-gray-900">{order.shippingAddress?.phone || 'Không có'}</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Thông tin giao hàng</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="text-gray-900">{order.shippingAddress?.address || 'Không có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="text-gray-900">{order.shippingAddress?.phone || 'Không có'}</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Thông tin thanh toán</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="text-gray-900">
                    {order.payment?.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                     order.payment?.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 
                     order.payment?.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 
                     order.payment?.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                  <p className={`${
                    order.payment?.status === 'PENDING' ? 'text-yellow-600' : 
                    order.payment?.status === 'COMPLETED' ? 'text-green-600' : 
                    order.payment?.status === 'FAILED' ? 'text-red-600' : 
                    'text-gray-900'
                  } font-medium`}>
                    {order.payment?.status === 'PENDING' ? 'Chờ thanh toán' : 
                     order.payment?.status === 'COMPLETED' ? 'Đã thanh toán' : 
                     order.payment?.status === 'FAILED' ? 'Thanh toán thất bại' : 
                     order.payment?.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailDialog;