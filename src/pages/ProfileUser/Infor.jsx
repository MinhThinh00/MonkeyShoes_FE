import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../redux/slices/userSlice';
import uploadImage from '../../helper/uploadImage';
import axios from 'axios';

import { FaUser, FaEnvelope, FaMapMarkerAlt, FaSave, FaKey, FaUpload, FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

const Infor = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const API_BASE = import.meta.env.VITE_API_URI || 'http://localhost:8080/api';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentAddress, setCurrentAddress] = useState({
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    isDefault: false
  });

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Tạo axios instance với config chung
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URI || 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/${currentUser.userId}`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();

        // Check if the response contains valid data
        if (!data) {
          console.error('Invalid data format received:', data);
          setFormData({
            userName: currentUser.name || '',
            email: currentUser.email || '',
          });
          return;
        }

        // Store the user profile data
        setUserProfile(data);

        // Set form data from the response
        setFormData({
          userName: data.userName || '',
          email: data.email || currentUser.email || '',
        });

        // Set avatar preview if available
        if (data.img) {
          setAvatarPreview(data.img);
        }

        // Fetch user addresses
        fetchUserAddresses();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Không thể tải thông tin người dùng');
        setFormData({
          userName: currentUser.name || '',
          email: currentUser.email || '',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchUserAddresses = async () => {
      try {
        const { data } = await api.get(`/address/user/${currentUser.userId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });

        // Sort addresses with default first
        const sorted = [...data].sort((a, b) => (b.isDefault ? 1 : -1));
        setAddresses(sorted);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error(error.response?.data?.message || 'Không thể tải danh sách địa chỉ');
      }
    };

    if (currentUser?.userId) {
      fetchUserProfile();
    }
  }, [currentUser, API_BASE]);

  // Fetch provinces when component mounts
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        if (!response.ok) {
          throw new Error('Failed to fetch provinces');
        }
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        toast.error('Không thể tải danh sách tỉnh thành');
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!currentAddress.province) {
        setDistricts([]);
        return;
      }

      try {
        // Đảm bảo luôn dùng code
        const provinceCode = provinces.find(p => 
          p.code == currentAddress.province || p.name === currentAddress.province
        )?.code;

        if (!provinceCode) {
          console.error('Invalid province code');
          return;
        }

        const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        if (!response.ok) throw new Error('Failed to fetch districts');
        
        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
        toast.error('Không thể tải danh sách quận huyện');
      }
    };

    fetchDistricts();
  }, [currentAddress.province]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!currentAddress.district) {
        setWards([]);
        return;
      }

      try {
        // Đảm bảo luôn dùng code
        const districtCode = districts.find(d => 
          d.code == currentAddress.district || d.name === currentAddress.district
        )?.code;

        if (!districtCode) {
          console.error('Invalid district code');
          return;
        }

        const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        if (!response.ok) throw new Error('Failed to fetch wards');
        
        const data = await response.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Error fetching wards:', error);
        toast.error('Không thể tải danh sách phường xã');
        // Thêm retry logic
        setTimeout(() => fetchWards(), 1000); // Thử lại sau 1 giây nếu lỗi
      }
    };

    fetchWards();
  }, [currentAddress.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let requestBody = { ...formData };

      if (avatarFile) {
        try {
          const uploadResult = await uploadImage(avatarFile);
          if (uploadResult && uploadResult.url) {
            // Add the image URL to the request body
            requestBody.img = uploadResult.secure_url;
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
          setSaving(false);
          return;
        }
      }

      // Now send the request with JSON data including the image URL if available
      const response = await fetch(`${API_BASE}/users/${currentUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      // Update local storage and redux state
      const updatedUser = {
        ...currentUser,
        name: formData.userName,
        email: formData.email,
        avatar: requestBody.img || currentUser.avatar
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(loginSuccess(updatedUser));

      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/users/${currentUser.userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success('Đổi mật khẩu thành công');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!currentAddress.phone || !currentAddress.province || !currentAddress.district || 
          !currentAddress.ward || !currentAddress.address) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const addressData = {
        phone: currentAddress.phone,
        province: currentAddress.province,
        district: currentAddress.district,
        ward: currentAddress.ward,
        address: currentAddress.address,
        isDefault: currentAddress.isDefault,
        userId: currentUser.userId
      };

      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      };

      if (currentAddress.id) {
        // Update existing address
        await api.put(`/address/${currentAddress.id}`, addressData, config);
      } else {
        // Create new address
        await api.post('/address', addressData, config);
      }

      // Refetch addresses after successful update
      await fetchUserAddresses();
      toast.success(currentAddress.id ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
      setShowAddressModal(false);
      
      // Reset form
      setCurrentAddress({
        phone: '',
        province: '',
        district: '',
        ward: '',
        address: '',
        isDefault: false
      });

    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    const provinceCode = provinces.find(p => 
      p.code == address.province || p.name === address.province
    )?.code;

    // Fetch districts first
    const fetchDistrictsForEdit = async () => {
      if (!provinceCode) return;
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts || []);
        
        // Now find district code from the fetched districts
        const districtCode = data.districts?.find(d => 
          d.name === address.district || d.code == address.district
        )?.code;

        if (districtCode) {
          // Fetch wards
          const wardResponse = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
          const wardData = await wardResponse.json();
          setWards(wardData.wards || []);
          
          // Find ward code
          const wardCode = wardData.wards?.find(w => 
            w.name === address.ward || w.code == address.ward
          )?.code;

          // Set current address with all codes
          setCurrentAddress({
            ...address,
            province: provinceCode,
            district: districtCode,
            ward: wardCode,
          });
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
        toast.error('Không thể tải thông tin địa chỉ');
      }
    };

    fetchDistrictsForEdit();
    setShowAddressModal(true);
  };
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await api.delete(`/address/${addressId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });

        await fetchUserAddresses();
        toast.success('Xóa địa chỉ thành công');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error(error.response?.data?.message || 'Không thể xóa địa chỉ');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      if (!address) return;

      const updatedAddress = {
        ...address,
        isDefault: true
      };

      await api.put(`/address/${addressId}`, updatedAddress, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });

      await fetchUserAddresses();
      toast.success('Đã đặt địa chỉ mặc định');

    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error(error.response?.data?.message || 'Không thể đặt địa chỉ mặc định');
    }
  };
  console.log(userProfile)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

      <div className="mb-8 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
            {avatarPreview ? (
              <img
                src={avatarPreview || userProfile?.img}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <FaUser className="text-blue-500 text-4xl" />
              </div>
            )}
          </div>
          <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
            <FaUpload />
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <h3 className="text-xl font-semibold">{formData.userName}</h3>
        <p className="text-gray-500">{formData.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <FaUser className="inline mr-2 text-gray-500" />
              Họ và tên
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập họ và tên"
            />
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
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="Nhập email"
              disabled
            />
            <p className="text-xs text-gray-500">Email không thể thay đổi</p>
          </div>
        </div>

        <div className="pt-4 flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Lưu thay đổi
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <FaKey className="mr-2" />
            Đổi mật khẩu
          </button>
        </div>
      </form>

      {/* Address Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Địa chỉ của tôi</h3>
          <button
            onClick={() => {
              setCurrentAddress({
                id: null,
                phone: '',
                province: '',
                district: '',
                ward: '',
                address: '',
                isDefault: addresses.length === 0 // Set default if this is the first address
              });
              setShowAddressModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Thêm địa chỉ mới
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(address => (
              <div
                key={address.id}
                className={`border ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg p-4 relative`}
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                    Mặc định
                  </span>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p><span className="font-medium">Số điện thoại:</span> {address.phone}</p>
                  <p><span className="font-medium">Tỉnh/Thành phố:</span> {provinces.find(p => p.code == address.province)?.name || address.province}</p>
                  <p><span className="font-medium">Quận/Huyện:</span> {districts.find(d => d.code == address.district)?.name || address.district}</p>
                  <p><span className="font-medium">Phường/Xã:</span> {wards.find(w => w.code == address.ward)?.name || address.ward}</p>
                  <p className="md:col-span-2"><span className="font-medium">Địa chỉ chi tiết:</span> {address.address}</p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Sửa
                  </button>
                  {!address.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefaultAddress(address.id)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                      >
                        <FaCheck className="mr-1" size={12} />
                        Đặt mặc định
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                      >
                        <FaTrash className="mr-1" size={12} />
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Đổi mật khẩu</h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {currentAddress.id ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={currentAddress.phone}
                  onChange={handleAddressChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tỉnh/Thành phố
                </label>
                <select
                  name="province"
                  value={currentAddress.province}
                  onChange={handleAddressChange}
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quận/Huyện
                </label>
                <select
                  name="district"
                  value={currentAddress.district}
                  onChange={handleAddressChange}
                  required
                  disabled={!currentAddress.province}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map(district => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phường/Xã
                </label>
                <select
                  name="ward"
                  value={currentAddress.ward}
                  onChange={handleAddressChange}
                  required
                  disabled={!currentAddress.district}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map(ward => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ chi tiết
                </label>
                <input
                  type="text"
                  name="address"
                  value={currentAddress.address}
                  onChange={handleAddressChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ chi tiết (số nhà, đường, ...)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={currentAddress.isDefault}
                  onChange={handleAddressChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang xử lý...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Infor;
