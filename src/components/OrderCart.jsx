import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { FaShoppingBag, FaHome, FaCreditCard, FaClock } from 'react-icons/fa';

const OrderCart = ({ order }) => {
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

  return (
    <div className="order-card" style={{ 
      marginBottom: 16, 
      borderRadius: 8, 
      border: '1px solid #e8e8e8',
      boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
      backgroundColor: '#fff',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row'
    }}>
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
              backgroundColor: getStatusColor(order.status)
            }}></span>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {order.status === 'PENDING' ? 'Chờ xác nhận' : 
               order.status === 'PROCESSING' ? 'Đang xử lý' :
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
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {formatCurrency(order.totalPrice)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCart;