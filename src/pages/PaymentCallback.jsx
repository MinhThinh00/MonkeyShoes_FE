import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { FaCheckCircle, FaTimesCircle, FaHome } from 'react-icons/fa';

const PaymentCallback = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        // Get the current URL with query parameters
        const currentUrl = window.location.href;
        
        // Call the payment-callback API with the URL parameters
        const response = await fetch(`http://localhost:8169/api/payment/payment-callback${location.search}`);
        const result = await response.json();
        
        setPaymentStatus(result.success);
        setOrderDetails(result.data);
        
        if (result.success) {
          toast.success('Thanh toán thành công!');
        } else {
          toast.error('Thanh toán thất bại: ' + result.message);
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        toast.error('Đã xảy ra lỗi khi xử lý kết quả thanh toán');
        setPaymentStatus(false);
      } finally {
        setLoading(false);
      }
    };
    
    processPaymentCallback();
  }, [location]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              {paymentStatus ? (
                <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
              ) : (
                <FaTimesCircle className="mx-auto text-red-500 text-6xl mb-4" />
              )}
              
              <h1 className="text-2xl font-bold mb-2">
                {paymentStatus ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
              </h1>
              
              <p className="text-gray-600 mb-6">
                {paymentStatus 
                  ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.' 
                  : 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
              </p>
              
              {orderDetails && paymentStatus && (
                <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
                  <h2 className="font-semibold text-lg mb-2">Chi tiết đơn hàng</h2>
                  <div className="space-y-1">
                    <p><span className="font-medium">Mã đơn hàng:</span> {orderDetails.orderId}</p>
                    <p><span className="font-medium">Mã giao dịch:</span> {orderDetails.transactionId}</p>
                    <p><span className="font-medium">Số tiền:</span> {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(orderDetails.amount / 100)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaHome className="mr-2" />
                  Trang chủ
                </Link>
                
                {!paymentStatus && (
                  <Link 
                    to="/cart" 
                    className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Quay lại giỏ hàng
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PaymentCallback;