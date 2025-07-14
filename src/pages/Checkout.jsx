import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Footer from '../components/Footer/Footer';
import { useLocation, useNavigate, Link } from 'react-router-dom';
// Xóa import useForm từ react-hook-form
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaCheck, FaPlus, FaEdit } from 'react-icons/fa';
import axios from 'axios';

// Sửa lại custom hook để không sử dụng setValue từ react-hook-form
const useFetchAddresses = (api, currentUser, setAddresses, setSelectedAddressId, setFormData, provinces, setShowAddressForm) => {
  const fetchUserAddresses = useCallback(async () => {
    try {
      if (!currentUser?.userId) return;
      const { data } = await api.get(`/address/user/${currentUser.userId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const sorted = [...data].sort((a, b) => (b.isDefault ? 1 : -1));
      setAddresses(sorted);
      const defaultAddress = sorted.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData(prevData => ({
          ...prevData,
          phone: defaultAddress.phone || '',
          province: provinces.find((p) => p.name === defaultAddress.province)?.code || '',
          district: defaultAddress.district ? provinces.find((p) => p.name === defaultAddress.province)?.districts?.find((d) => d.name === defaultAddress.district)?.code || '' : '',
          ward: defaultAddress.ward ? provinces.find((p) => p.name === defaultAddress.province)?.districts?.find((d) => d.name === defaultAddress.district)?.wards?.find((w) => w.name === defaultAddress.ward)?.code || '' : '',
          address: defaultAddress.address || ''
        }));
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách địa chỉ');
    }
  }, [api, currentUser, setAddresses, setSelectedAddressId, setFormData, provinces, setShowAddressForm]);

  return fetchUserAddresses;
};

const Checkout = () => {
  const API_BASE = import.meta.env.VITE_API_URI;
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  
  // Thay thế useForm bằng useState
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
    fromCart: true,
  });
  
  // State để quản lý lỗi form
  const [formErrors, setFormErrors] = useState({});

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(1);

  const api = useMemo(() => axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
  }), [API_BASE]);

  // Cập nhật hook để sử dụng setFormData thay vì setValue
  const fetchUserAddresses = useFetchAddresses(api, currentUser, setAddresses, setSelectedAddressId, setFormData, provinces, setShowAddressForm);

  useEffect(() => {
    const storedStore = localStorage.getItem('selectedStore');
    if (storedStore) setSelectedStore(parseInt(storedStore));
  }, []);

  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho trường phone - chỉ cho phép nhập số
    if (name === 'phone') {
      // Chỉ giữ lại các ký tự số
      const numericValue = value.replace(/\D/g, '');
      
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // Validate số điện thoại
      if (numericValue.length === 0) {
        setFormErrors({
          ...formErrors,
          phone: 'Vui lòng nhập số điện thoại'
        });
      } else if (numericValue.length !== 10) {
        setFormErrors({
          ...formErrors,
          phone: 'Số điện thoại phải có đủ 10 chữ số'
        });
      } else {
        // Xóa lỗi nếu hợp lệ
        const newErrors = {...formErrors};
        delete newErrors.phone;
        setFormErrors(newErrors);
      }
    } else {
      // Xử lý bình thường cho các trường khác
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSelectAddress = useCallback((addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find((addr) => addr.id === addressId);
    if (selectedAddress) {
      setFormData(prevData => ({
        ...prevData,
        phone: selectedAddress.phone || '',
        province: provinces.find((p) => p.name === selectedAddress.province)?.code || '',
        district: districts.find((d) => d.name === selectedAddress.district)?.code || '',
        ward: wards.find((w) => w.name === selectedAddress.ward)?.code || '',
        address: selectedAddress.address || ''
      }));
      setShowAddressForm(false);
      setShowAddressDialog(false);
    }
  }, [addresses, provinces, districts, wards]);

  const handleNewAddress = useCallback(() => {
    setSelectedAddressId(null);
    setShowAddressForm(true);
    setFormData(prevData => ({
      ...prevData,
      fullName: currentUser?.fullName || '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      address: ''
    }));
    setShowAddressDialog(false);
  }, [currentUser]);

  useEffect(() => {
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      setTotalPrice(location.state.totalPrice);
      setItemCount(location.state.itemCount);
      setFormData(prevData => ({
        ...prevData,
        fromCart: location.state.fromCart !== undefined ? location.state.fromCart : true
      }));
      setLoading(false);
      if (currentUser?.userId) fetchUserAddresses();
    } else {
      toast.error('Không có thông tin giỏ hàng. Vui lòng thử lại.');
      navigate('/cart');
    }
  }, [location, navigate, currentUser, fetchUserAddresses]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        toast.error('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    fetchProvinces();
  }, []);

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
        setFormData(prevData => ({
          ...prevData,
          district: '',
          ward: ''
        }));
      } catch (error) {
        toast.error('Không thể tải danh sách quận/huyện');
      }
    };
    fetchDistricts();
  }, [formData.province]);

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
        setFormData(prevData => ({
          ...prevData,
          ward: ''
        }));
      } catch (error) {
        toast.error('Không thể tải danh sách phường/xã');
      }
    };
    fetchWards();
  }, [formData.district]);

  const checkDiscountCode = useCallback(async () => {
    if (!discountCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setCheckingDiscount(true);
    try {
      const response = await api.get(`/discounts/check-discount?code=${discountCode}`, {
        headers: { Authorization: `Bearer ${currentUser?.token}` },
      });
      const data = response.data;
      if (data.success) {
        setDiscount(data.data);
        toast.success('Áp dụng mã giảm giá thành công!', { duration: 3000 });
      } else {
        setDiscount(null);
        toast.error(data.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi kiểm tra mã giảm giá');
      setDiscount(null);
    } finally {
      setCheckingDiscount(false);
    }
  }, [discountCode, api, currentUser]);

  useEffect(() => {
    if (discount && (discount.active || discount.isActive)) {
      const discountValue = (totalPrice * discount.discountPercentage) / 100;
      setDiscountAmount(discountValue);
      setFinalPrice(totalPrice - discountValue);
    } else {
      setDiscountAmount(0);
      setFinalPrice(totalPrice);
    }
  }, [discount, totalPrice]);

  // Hàm validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName) errors.fullName = 'Vui lòng nhập họ và tên';
    else if (formData.fullName.length < 2) errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    
    if (!formData.email) errors.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Email không hợp lệ';
    
    if (showAddressForm || addresses.length === 0) {
      if (!formData.province) errors.province = 'Vui lòng chọn tỉnh/thành phố';
      if (!formData.district) errors.district = 'Vui lòng chọn quận/huyện';
      if (!formData.ward) errors.ward = 'Vui lòng chọn phường/xã';
      if (!formData.phone) errors.phone = 'Vui lòng nhập số điện thoại';
      else if (formData.phone.length !== 10) errors.phone = 'Số điện thoại phải có đủ 10 chữ số';
      if (!formData.address) errors.address = 'Vui lòng nhập địa chỉ cụ thể';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const selectedProvince = provinces.find((p) => p.code === parseInt(formData.province))?.name || '';
      const selectedDistrict = districts.find((d) => d.code === parseInt(formData.district))?.name || '';
      const selectedWard = wards.find((w) => w.code === parseInt(formData.ward))?.name || '';

      const itemsWithPrice = cartItems.map((item) => ({
        ...item,
        price: item.price || item.unitPrice,
        quantity: item.quantity || 1,
        productId: item.productId,
        variantId: item.variantId?? item.id,
      }));

      let addressDTO;
      if (selectedAddressId && !showAddressForm) {
        const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
        addressDTO = {
          id: selectedAddress.id,
          userId: currentUser?.userId,
          phone: selectedAddress.phone,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          address: selectedAddress.address,
          isDefault: selectedAddress.isDefault,
        };
      } else {
        addressDTO = {
          userId: currentUser?.userId,
          phone: formData.phone,
          province: selectedProvince,
          district: selectedDistrict,
          ward: selectedWard,
          address: formData.address,
          isDefault: false,
        };
      }

      const orderData = {
        fullName: formData.fullName,
        email: formData.email,
        addressDTO,
        discount_code: discount ? discountCode : null,
        storeId: selectedStore || 1,
        items: itemsWithPrice,
        totalAmount: discount && (discount.active || discount.isActive) ? finalPrice : totalPrice,
        paymentMethod: formData.paymentMethod,
        isFromCart: formData.fromCart,
        note: formData.note,
      };

      toast.loading('Đang xử lý đơn hàng...', { id: 'order-processing' });
      const userId = currentUser?.userId;
      if (!userId) {
        toast.dismiss('order-processing');
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      const orderResponse = await fetch(`${API_BASE}/orders?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      if (!orderResponse.ok) {
        toast.dismiss('order-processing');
        toast.error(orderResult.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        return;
      }
      console.log(orderResult)
      const firstData = orderResult.data?.[0];
      const orderId = firstData.orderId || orderResult.data?.id;
      const vnp_TxnRef = firstData.vnpTxnRef;

      if (formData.paymentMethod === 'vnpay') {
        try {
          //const orderId = orders[0].orderId;
          const params = new URLSearchParams();
          params.append('amount', Math.round(discount && (discount.active || discount.isActive) ? finalPrice : totalPrice));
          params.append('orderInfo', `Thanh toán đơn hàng #${orderId}`);
          params.append('vnpTxnRef', vnp_TxnRef);
          const response = await fetch(`${API_BASE}/payment/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });

          const result = await response.json();
          if (result.success && result.data.paymentUrl) {
            toast.dismiss('order-processing');
            toast.success('Đang chuyển hướng đến cổng thanh toán...', { duration: 2000 });
            localStorage.setItem('pendingOrderId', orderId);
            window.location.href = result.data.paymentUrl;
          } else {
            toast.dismiss('order-processing');
            toast.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
            navigate('/profile', {
              state: { message: 'Đơn hàng đã được tạo nhưng thanh toán chưa hoàn tất. Bạn có thể thanh toán sau.' },
            });
          }
        } catch (error) {
          toast.dismiss('order-processing');
          toast.error('Đã xảy ra lỗi khi tạo thanh toán. Vui lòng thử lại.');
          navigate('/profile');
        }
      } else {
        toast.dismiss('order-processing');
        toast.success('Đặt hàng thành công!', { duration: 3000 });
        navigate('/profile', {
          state: { orderId, orderData: orderResult.data },
        });
      }
    } catch (error) {
      toast.dismiss('order-processing');
      toast.error('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId) || addresses.find((addr) => addr.isDefault);

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link to="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
            <FaArrowLeft className="mr-2" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Thanh toán</h1>
        </div>
      </header>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thông tin giao hàng</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Địa chỉ giao hàng</h3>
                  {selectedAddress ? (
                    <div className="border rounded-lg p-4 bg-blue-50 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{formData.fullName}</p>
                          <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                          <p className="text-sm text-gray-600">{selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}</p>
                          {selectedAddress.isDefault && (
                            <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Mặc định</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddressDialog(true)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Chưa có địa chỉ. Vui lòng thêm địa chỉ mới.</p>
                  )}
                </div>
                {/* Address Dialog */}
                {showAddressDialog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                      <h3 className="text-lg font-medium text-gray-700 mb-4">Chọn địa chỉ giao hàng</h3>
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                              selectedAddressId === address.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                            }`}
                            onClick={() => handleSelectAddress(address.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">{formData.fullName}</p>
                                <p className="text-sm text-gray-600">{address.phone}</p>
                                <p className="text-sm text-gray-600">{address.address}, {address.ward}, {address.district}, {address.province}</p>
                                {address.isDefault && (
                                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Mặc định</span>
                                )}
                              </div>
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddressId === address.id}
                                onChange={() => handleSelectAddress(address.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleNewAddress}
                          className="flex items-center justify-center w-full text-blue-600 hover:text-blue-800 border border-dashed border-gray-300 rounded-lg py-3 hover:bg-blue-50 transition-all duration-200"
                        >
                          <FaPlus className="mr-2" /> Thêm địa chỉ mới
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddressDialog(false)}
                        className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <FaUser className="mr-2 text-gray-500" /> Họ và tên
                      </label>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập họ và tên"
                        disabled={!showAddressForm}
                      />
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                        {showAddressForm ? 'Nhập họ và tên cho địa chỉ mới' : 'Họ và tên từ thông tin tài khoản'}
                      </div>
                      {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                    </div>
                    <div className="relative group">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <FaEnvelope className="mr-2 text-gray-500" /> Email
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Nhập email"
                        disabled
                      />
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                        Email từ thông tin tài khoản
                      </div>
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                  </div>
                  {(showAddressForm || addresses.length === 0) && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-gray-500" /> Địa chỉ giao hàng
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                          <select
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="">Chọn Tỉnh/Thành phố</option>
                            {provinces.map((province) => (
                              <option key={province.code} value={province.code}>
                                {province.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                            Chọn tỉnh/thành phố của bạn
                          </div>
                          {formErrors.province && <p className="text-red-500 text-xs mt-1">{formErrors.province}</p>}
                        </div>
                        <div className="relative group">
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            disabled={!formData.province}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all duration-200"
                          >
                            <option value="">Chọn Quận/Huyện</option>
                            {districts.map((district) => (
                              <option key={district.code} value={district.code}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                            Chọn quận/huyện của bạn
                          </div>
                          {formErrors.district && <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>}
                        </div>
                        <div className="relative group">
                          <select
                            name="ward"
                            value={formData.ward}
                            onChange={handleInputChange}
                            disabled={!formData.district}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all duration-200"
                          >
                            <option value="">Chọn Phường/Xã</option>
                            {wards.map((ward) => (
                              <option key={ward.code} value={ward.code}>
                                {ward.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                            Chọn phường/xã của bạn
                          </div>
                          {formErrors.ward && <p className="text-red-500 text-xs mt-1">{formErrors.ward}</p>}
                        </div>
                      </div>
                      <div className="relative group mt-4">
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Nhập số điện thoại (10 chữ số)"
                        />
                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                      <div className="relative group mt-4">
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Số nhà, tên đường"
                        />
                        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                          Nhập số nhà và tên đường
                        </div>
                        {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chi tiết địa điểm giao hàng."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`border rounded-md p-4 cursor-pointer transition-all duration-300 ${
                          formData.paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                        }`}
                        onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</span>
                            <span className="block text-xs text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-md p-4 cursor-pointer transition-all duration-300 ${
                          formData.paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                        }`}
                        onClick={() => setFormData({...formData, paymentMethod: 'vnpay'})}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="vnpay"
                            checked={formData.paymentMethod === 'vnpay'}
                            onChange={handleInputChange}
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
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={Object.keys(formErrors).length > 0}
                  >
                    {formData.paymentMethod === 'vnpay' ? 'Thanh toán với VNPay' : 'Đặt hàng ngay'}
                  </button>
                </form>
              </div>
            </div>
            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tổng quan đơn hàng</h2>
                <div className="max-h-80 overflow-y-auto mb-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start py-3 border-b border-gray-200">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={item.imageUrl} alt={item.id} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium">{item.productName}</h3>
                        <p className="text-xs text-gray-500">{item.variantName || `${item.color} - ${item.size}`}</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500 text-gray-500">SL: {item.quantity}</span>
                          <span className="text-sm font-medium">{item.totalPrice}</span>
                          <span className="text-sm font-medium text-gray-800">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice)}
                          </span>
                        </div>
                    </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="relative group">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={checkDiscountCode}
                        disabled={checkingDiscount}
                        className="px-4 py-2 bg-blue-600 text-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:bg-blue-800 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:cursor-not-allowed"
                      >
                        {checkingDiscount ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </button>
                    </div>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                      Nhập mã giảm giá để được ưu đãi
                    </div>
                    {discount && (discount.active || discount.isActive) && (
                      <div className="text-green-600 text-green-600 sm:flex sm:text-sm flex items-center mt-2">
                        <FaCheck className="mr-1"/> Đã áp dụng mã giảm giá: {discount.discountPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền hàng</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </span>
                  </div>
                  {discount && (discount.active || discount.isActive) && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({discount.discountPercentage}%)</span>
                      <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-lg font-semibold">Tổng cộng</span>
                    <span className="text-xl font-bold text-red-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        discount && (discount.active || discount.isActive) ? finalPrice : totalPrice
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
};

export default Checkout;