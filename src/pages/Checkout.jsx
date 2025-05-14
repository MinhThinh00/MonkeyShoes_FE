import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';

const Checkout = () => {
const API_BASE = import.meta.env.VITE_API_URI;
// console.log('API_BASE:', API_BASE);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.currentUser);
  
  // Get cart data from location state
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Form state for shipping information
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
    paymentMethod: 'cod' // Default payment method
  });
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    // Check if we have cart data in location state
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      setTotalPrice(location.state.totalPrice);
      setItemCount(location.state.itemCount);
      // Set fromCart value from location state, default to true if not specified
      setFormData(prev => ({
        ...prev,
        fromCart: location.state.fromCart !== undefined ? location.state.fromCart : true
      }));
      setLoading(false);
    } else {
      // If no cart data, redirect back to cart
      toast.error('Không có thông tin giỏ hàng. Vui lòng thử lại.');
      navigate('/cart');
    }
  }, [location, navigate]);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    
    fetchProvinces();
  }, []);
  
  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.province) {
        setDistricts([]);
        return;
      }
      
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${formData.province}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts || []);
        setFormData(prev => ({ ...prev, district: '', ward: '' }));
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    
    fetchDistricts();
  }, [formData.province]);
  
  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.district) {
        setWards([]);
        return;
      }
      
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`);
        const data = await response.json();
        setWards(data.wards || []);
        setFormData(prev => ({ ...prev, ward: '' }));
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    };
    
    fetchWards();
  }, [formData.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Update the handleSubmit function to properly call the payment API
  // Update the handleSubmit function to ensure all items have price field
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone || !formData.address || 
        !formData.province || !formData.district || !formData.ward || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    
    try {
      // Make sure all cart items have the required price field
      const itemsWithPrice = cartItems.map(item => ({
        ...item,
        price: item.price || item.unitPrice, // Ensure price field exists
        quantity: item.quantity || 1,
        productId: item.productId,
        variantId: item.id
      }));
      
      // Create order data
      const orderData = {
        ...formData,
        storeId: 1,
        items: itemsWithPrice,
        totalAmount: totalPrice,
        paymentMethod: formData.paymentMethod,
        isFromCart: formData.fromCart // Include the fromCart flag
      };
      
      console.log('Order data:', orderData);
      
      toast.loading('Đang xử lý đơn hàng...');
      
      // Add userId as a query parameter
      const userId = currentUser?.userId;
      if (!userId) {
        toast.dismiss();
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      
      // Rest of the function remains the same
      const orderResponse = await fetch(`${API_BASE}/orders?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(orderData)
      });
      
      const orderResult = await orderResponse.json();
      
      if (!orderResponse.ok) {
        toast.dismiss();
        toast.error(orderResult.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        return;
      }
      console.log('Order created:', orderResult.data);
      const orderId = orderResult.data?.orderId || orderResult.data?.id;
      const vnp_TxnRef = orderResult.data?.vnpTxnRef;
      console.log('vn_TxnRef', orderResult.data?.vnpTxnRef);
      console.log('vnpTxnRef:', vnp_TxnRef);
      if (formData.paymentMethod === 'vnpay') {
        // Handle VNPay payment after order creation
        try {
          // Call the create-payment API with order ID
          const params = new URLSearchParams();
          params.append('amount', Math.round(totalPrice));
          params.append('orderInfo', `Thanh toán đơn hàng #${orderId}`);
          params.append('vnpTxnRef',vnp_TxnRef)
          const response = await fetch(`${API_BASE}/payment/create-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
          });
          
          const result = await response.json();
          console.log(result);
          
          if (result.success && result.data.paymentUrl) {
            // Redirect to VNPay payment URL
            toast.dismiss();
            toast.success('Đang chuyển hướng đến cổng thanh toán...');
            
            // Store orderId in localStorage for payment callback verification
            localStorage.setItem('pendingOrderId', orderId);
            
            // Redirect to payment page
            window.location.href = result.data.paymentUrl;
          } else {
            toast.dismiss();
            toast.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
            
            navigate('/profile', { 
              state: { 
                message: 'Đơn hàng đã được tạo nhưng thanh toán chưa hoàn tất. Bạn có thể thanh toán sau.' 
              } 
            });
          }
        } catch (error) {
          toast.dismiss();
          console.error('Error creating payment:', error);
          toast.error('Đã xảy ra lỗi khi tạo thanh toán. Vui lòng thử lại.');
          
          navigate('/profile');
        }
      } else {
        // For COD, the order is already created
        toast.dismiss();
        toast.success('Đặt hàng thành công!');
        
        navigate('/order-success', { 
          state: { 
            orderId: orderId,
            orderData: orderResult.data
          } 
        });
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error creating order:', error);
      toast.error('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <FaArrowLeft className="mr-2" />
              <span>Quay lại giỏ hàng</span>
            </Link>
            <h1 className="text-2xl font-bold mt-4">Thanh toán</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <FaUser className="inline mr-2 text-gray-500" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <FaPhone className="inline mr-2 text-gray-500" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <FaEnvelope className="inline mr-2 text-gray-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
                      Địa chỉ giao hàng
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {provinces.map(province => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.province}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map(district => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <select
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.district}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map(ward => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số nhà, tên đường"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    ></textarea>
                  </div>
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Phương thức thanh toán
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === 'cod' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                      >
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={formData.paymentMethod === 'cod'} 
                            onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</span>
                            <span className="block text-xs text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</span>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === 'vnpay' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({...formData, paymentMethod: 'vnpay'})}
                      >
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={formData.paymentMethod === 'vnpay'} 
                            onChange={() => setFormData({...formData, paymentMethod: 'vnpay'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">Thanh toán qua VNPay</span>
                            <span className="block text-xs text-gray-500 mt-1">Thanh toán trực tuyến qua cổng VNPay</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  {/* <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      formData.fullName && formData.phone && formData.address && 
                      formData.province && formData.district && formData.ward
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={
                      !formData.fullName || !formData.phone || !formData.address || 
                      !formData.province || !formData.district || !formData.ward
                    }
                  >
                    {formData.paymentMethod === 'vnpay' 
                      ? 'Thanh toán với VNPay' 
                      : 'Đặt hàng ngay'}
                  </button> */}
                </form>
              </div>
            </div>
            
            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Tổng quan đơn hàng</h2>
                
                <div className="max-h-80 overflow-y-auto mb-4">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-3 flex items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.productName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-800">{item.productName}</h3>
                          <p className="text-xs text-gray-500">
                            {item.variantName || `${item.color} - ${item.size}`}
                          </p>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                            <span className="text-sm font-medium text-gray-800">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(totalPrice)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-lg font-semibold">Tổng cộng</span>
                    <span className="text-xl font-bold text-red-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(totalPrice)}
                    </span>
                  </div>
                </div>
                <button
                onClick={handleSubmit}
                    type="submit"
                    className={` mt-3 w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      formData.fullName && formData.phone && formData.address && 
                      formData.province && formData.district && formData.ward && formData.email
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={
                      !formData.fullName || !formData.phone || !formData.address || 
                      !formData.province || !formData.district || !formData.ward || !formData.email
                    }
                  >
                    {formData.paymentMethod === 'vnpay' 
                      ? 'Thanh toán với VNPay' 
                      : 'Đặt hàng ngay'}
                  </button>
              </div>
              
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;