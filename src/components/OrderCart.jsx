import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { FaShoppingBag, FaHome, FaCreditCard, FaClock, FaTimes, FaEye } from 'react-icons/fa';
import { updateOrderStatus } from '../helper/orderHelper';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
const OrderCart = ({ order, onOrderStatusChange }) => {

  const currentUser = useSelector((state) => state.user.currentUser);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#f5a623'; // orange
      case 'COMPLETED':
        return '#52c41a'; // green
      case 'CANCELLED':
        return '#f5222d'; // red
      case 'PROCESSING':
        return '#1890ff'; // blue
      case 'SHIPPED':
        return '#13c2c2'; // cyan
      default:
        return '#d9d9d9'; // default gray
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get the first item's image to display as the main image
  const mainImage = order.items[0]?.variant?.img || 'https://via.placeholder.com/150';

  // Get product names for display
  const productNames = order.items.map(item => `${item.variant.name} (x${item.quantity})`).join(', ');

  const handleCancelOrder = async () => {
    try {
      const response = await updateOrderStatus(order.id, 'CANCELLED', currentUser.token);
      if (response.data) {
        toast.success('Hủy đơn hàng thành công');
        onOrderStatusChange && onOrderStatusChange(order.id, 'CANCELLED');
        setShowCancelConfirm(false);
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    }
  };

  return (
    <>
      <div
        className="order-card"
        onClick={() => setShowDetails(true)}
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          backgroundColor: '#fff',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        {/* Product Image */}
        <div className="order-image" style={{
          width: '150px',
          height: '150px',
          flexShrink: 0,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
        }}>
          <img
            src={order.items[0]?.variant?.img || 'https://via.placeholder.com/150'}
            alt="Product"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Order Details */}
        <div className="order-details" style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Order Header */}
          <div className="order-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaShoppingBag />
              <span style={{ fontWeight: 'bold' }}>Đơn hàng #{order.id}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: `${getStatusColor(order.status)}20`,
              color: getStatusColor(order.status)
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(order.status),
                marginRight: '8px'
              }}></span>
              <span className="font-medium">
                {order.status === 'PENDING' ? 'Chờ xác nhận' :
                  order.status === 'PROCESSING' ? 'Chờ Shipper đến lấy hàng' :
                    order.status === 'SHIPPED' ? 'Đang giao hàng' :
                      order.status === 'COMPLETED' ? 'Hoàn thành' :
                        order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
              </span>
            </div>
          </div>

          {/* Product Names */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Sản phẩm:</div>
            <div style={{ fontSize: '14px' }}>{productNames}</div>
          </div>

          {/* Order Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCreditCard />
              <span>{order.payment.paymentMethod === 'VNPAY' ? 'VN Pay' :
                order.payment.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                  order.payment.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaClock />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Order Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaHome />
              <span style={{ fontSize: '14px' }}>{order.shippingAddress.address}</span>
            </div>
            <div className="flex items-center gap-4">
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {formatCurrency(order.totalPrice)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaEye className="mr-1" /> Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết đơn hàng Dialog */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chi tiết đơn hàng #{order.id}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Thông tin đơn hàng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(order.status),
                      marginRight: '8px'
                    }}></span>
                    <span className="font-medium">
                      {order.status === 'PENDING' ? 'Chờ xác nhận' :
                        order.status === 'PROCESSING' ? 'Chờ Shipper đến lấy hàng' :
                          order.status === 'SHIPPED' ? 'Đang giao hàng' :
                            order.status === 'COMPLETED' ? 'Hoàn thành' :
                              order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Sản phẩm</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.variant.img}
                          alt={item.variant.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.variant.productName}</p>
                          <p className="text-sm text-gray-600">{item.variant.name}</p>
                          <p className="text-sm">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Phương thức thanh toán</p>
                  <p className="flex items-center">
                    <FaCreditCard className="mr-2" />
                    {order.payment.paymentMethod === 'VNPAY' ? 'VN Pay' :
                      order.payment.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                        order.payment.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Địa chỉ giao hàng</p>
                  <p className="flex items-center">
                    <FaHome className="mr-2" />
                    {order.shippingAddress
                      ? `${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`
                      : 'Không có'}
                  </p>
                </div>
              </div>

              {/* Tổng tiền và nút hủy đơn */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg">
                  <span className="font-medium">Tổng tiền: </span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
                {order.status === 'PENDING' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCancelConfirm(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận hủy đơn */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Xác nhận hủy đơn</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng #{order.id}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Không
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCart;