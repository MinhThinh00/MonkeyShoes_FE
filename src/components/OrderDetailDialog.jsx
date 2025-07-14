import React, { useState, useEffect } from 'react';
import { getOrderById, updateOrderStatus } from '../helper/orderHelper';
import { FaTimes, FaSave, FaPrint } from 'react-icons/fa';
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
            setNewStatus(response.data.data.status);
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
          setOrder({ ...order, status: newStatus });
          if (onStatusUpdate) {
            onStatusUpdate(orderId, newStatus);
          }
          toast.success('Cập nhật trạng thái đơn hàng thành công!');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setUpdating(false);
    }
  };

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePrint = () => {
    // Tạo nội dung HTML để in
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Đơn hàng #${order.id}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            margin: 0; 
            line-height: 1.4;
          }
          h2, h3 { 
            color: #333; 
            margin-bottom: 10px;
          }
          .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
          }
          .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 15px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
          }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left; 
          }
          .table th { 
            background-color: #f8f9fa; 
            font-weight: bold;
          }
          .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .status-processing { background-color: #cce5ff; color: #004085; }
          .status-shipped { background-color: #d4edda; color: #155724; }
          .status-completed { background-color: #d1ecf1; color: #0c5460; }
          .status-cancelled { background-color: #f8d7da; color: #721c24; }
          @media print {
            body { padding: 10px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="section">
          <h2>CHI TIẾT ĐỞN HÀNG #${order.id}</h2>
          <p><strong>Ngày in:</strong> ${new Date().toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="section">
          <h3>Thông tin đơn hàng</h3>
          <div class="grid">
            <div>
              <div class="info-item">
                <span class="info-label">Ngày đặt hàng:</span> ${formatDate(order.createdAt)}
              </div>
              <div class="info-item">
                <span class="info-label">Trạng thái:</span> 
                <span class="status-badge status-${order.status.toLowerCase()}">
                  ${order.status === 'PENDING' ? 'Chờ Xác Nhận' :
                    order.status === 'PROCESSING' ? 'Đang Xử Lý' :
                    order.status === 'SHIPPED' ? 'Chờ Giao Hàng' :
                    order.status === 'COMPLETED' ? 'Hoàn Thành' :
                    order.status === 'CANCELLED' ? 'Hủy Đơn Hàng' : order.status}
                </span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="info-label">Khách hàng:</span> ${order.userName}
              </div>
              <div class="info-item">
                <span class="info-label">Tổng tiền:</span> <strong>${formatCurrency(order.totalPrice)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Sản phẩm</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items && order.items.map((item) => `
                <tr>
                  <td>
                    <div><strong>${item.variant.productName || 'Sản phẩm'}</strong></div>
                    <div style="color: #666; font-size: 14px;">${item.variant.name}</div>
                  </td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${item.quantity}</td>
                  <td><strong>${formatCurrency(item.totalPrice)}</strong></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">TỔNG CỘNG:</td>
                <td><strong>${formatCurrency(order.totalPrice)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="grid">
            <div>
              <h3>Thông tin khách hàng</h3>
              <div class="info-item">
                <span class="info-label">Tên khách hàng:</span> ${order.userName}
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span> ${order.userName}
              </div>
              <div class="info-item">
                <span class="info-label">Số điện thoại:</span> ${order.shippingAddress?.phone || 'Không có'}
              </div>
            </div>
            <div>
              <h3>Thông tin giao hàng</h3>
              <div class="info-item">
                <span class="info-label">Địa chỉ giao hàng:</span><br>
                ${order.shippingAddress
                  ? `${order.shippingAddress.address}<br>${order.shippingAddress.ward}, ${order.shippingAddress.district}<br>${order.shippingAddress.province}`
                  : 'Không có'}
              </div>
              <div class="info-item">
                <span class="info-label">Số điện thoại:</span> ${order.shippingAddress?.phone || 'Không có'}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Thông tin thanh toán</h3>
          <div class="grid">
            <div>
              <div class="info-item">
                <span class="info-label">Phương thức thanh toán:</span><br>
                ${order.payment?.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                  order.payment?.paymentMethod === 'VNPAY' ? 'VNPAY' :
                  order.payment?.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' :
                  order.payment?.paymentMethod || 'Không xác định'}
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="info-label">Trạng thái thanh toán:</span><br>
                <span style="color: ${
                  order.payment?.status === 'PENDING' ? '#856404' :
                  order.payment?.status === 'COMPLETED' ? '#155724' :
                  order.payment?.status === 'FAILED' ? '#721c24' : '#333'
                }; font-weight: bold;">
                  ${order.payment?.status === 'PENDING' ? 'Chờ thanh toán' :
                    order.payment?.status === 'COMPLETED' ? 'Đã thanh toán' :
                    order.payment?.status === 'FAILED' ? 'Thanh toán thất bại' :
                    order.payment?.status || 'Không xác định'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="section" style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Cảm ơn quý khách đã mua hàng!
          </p>
        </div>
      </body>
      </html>
    `;

    // Mở cửa sổ mới và in
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Đợi load xong rồi mới in
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
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
          <div className="flex items-center space-x-2">
            <button onClick={handlePrint} className="text-gray-500 hover:text-gray-700" title="In đơn hàng">
              <FaPrint className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="Đóng">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <p className="text-gray-900">
                    {order.shippingAddress
                      ? `${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`
                      : 'Không có'}
                  </p>
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
                  <p className={`${order.payment?.status === 'PENDING' ? 'text-yellow-600' :
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