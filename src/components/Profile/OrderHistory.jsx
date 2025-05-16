import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSearch, FaEye } from 'react-icons/fa';
import { updateOrderStatus } from '../../helper/orderHelper';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = useSelector(state => state.user.currentUser);
  const API_BASE = import.meta.env.VITE_API_URI;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE}/orders/user/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Không thể tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser?.userId) {
      fetchOrders();
    }
  }, [currentUser, API_BASE]);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.id?.toString().includes(searchTerm) || 
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h2>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc trạng thái..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status === 'PENDING' ? 'Chờ xác nhận' :
                       order.status === 'PROCESSING' ? 'Đang xử lý' :
                       order.status === 'SHIPPED' ? 'Đang giao hàng' :
                       order.status === 'DELIVERED' ? 'Đã giao hàng' :
                       order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> Xem chi tiết
                      </button>
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelDialog(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chi tiết đơn hàng Dialog */}
      {selectedOrder && !showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === 'PENDING' ? 'Chờ xác nhận' :
                     selectedOrder.status === 'PROCESSING' ? 'Đang xử lý' :
                     selectedOrder.status === 'SHIPPED' ? 'Đang giao hàng' :
                     selectedOrder.status === 'DELIVERED' ? 'Đã giao hàng' :
                     selectedOrder.status === 'CANCELLED' ? 'Đã hủy' : selectedOrder.status}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sản phẩm</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <img src={item.variant.img} alt={item.variant.name} className="w-16 h-16 object-cover rounded" />
                        <div className="ml-4">
                          <p className="font-medium">{item.variant.productName}</p>
                          <p className="text-sm text-gray-600">{item.variant.name}</p>
                          <p className="text-sm">x{item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <p className="font-semibold">Tổng tiền</p>
                  <p className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Xác nhận hủy đơn Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Xác nhận hủy đơn</h2>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrder.id}?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseCancelDialog}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Không
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
