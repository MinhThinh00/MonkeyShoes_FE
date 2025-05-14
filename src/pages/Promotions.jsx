import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaCalendar, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Promotions = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountPercentage: '',
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        // Mock data
        const mockDiscounts = Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          name: `Khuyến mãi ${i + 1}`,
          code: `KM${String(i + 1).padStart(4, '0')}`,
          discountPercentage: Math.floor(Math.random() * 50) + 10,
          startDate: new Date(Date.now() - Math.random() * 10000000000),
          endDate: new Date(Date.now() + Math.random() * 10000000000),
          isActive: Math.random() > 0.3,
          productCount: Math.floor(Math.random() * 20),
        }));
        
        setTimeout(() => {
          setDiscounts(mockDiscounts);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // In the useEffect mock data, add code field
  const mockDiscounts = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Khuyến mãi ${i + 1}`,
    code: `KM${String(i + 1).padStart(4, '0')}`,
    discountPercentage: Math.floor(Math.random() * 50) + 10,
    startDate: new Date(Date.now() - Math.random() * 10000000000),
    endDate: new Date(Date.now() + Math.random() * 10000000000),
    isActive: Math.random() > 0.3,
    productCount: Math.floor(Math.random() * 20),
  }));

  // Add edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Add handleEdit function
  const handleEdit = (discount) => {
    setFormData({
      name: discount.name,
      code: discount.code,
      discountPercentage: discount.discountPercentage,
      startDate: new Date(discount.startDate),
      endDate: new Date(discount.endDate),
      isActive: discount.isActive,
    });
    setEditingId(discount.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  // Update handleSubmit to handle both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.name || !formData.code || !formData.discountPercentage) {
      setFormError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      setFormError('Phần trăm giảm giá phải từ 0 đến 100');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    if (isEditMode) {
      // Update existing discount
      const updatedDiscounts = discounts.map(discount => 
        discount.id === editingId ? { ...discount, ...formData } : discount
      );
      setDiscounts(updatedDiscounts);
    } else {
      // Add new discount
      const newDiscount = {
        id: discounts.length + 1,
        ...formData,
        productCount: 0
      };
      setDiscounts([...discounts, newDiscount]);
    }

    // Reset form
    setShowForm(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      discountPercentage: '',
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
    });
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and pagination logic
  const filteredDiscounts = discounts.filter(discount =>
    discount.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDiscounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý khuyến mãi</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Thêm khuyến mãi
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-full max-w-3xl shadow-2xl rounded-xl bg-white">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditMode(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    code: '',
                    discountPercentage: '',
                    startDate: new Date(),
                    endDate: new Date(),
                    isActive: true,
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
              </h2>
              <p className="text-gray-500 mt-1">Vui lòng điền đầy đủ thông tin bên dưới</p>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg text-red-700 p-4 mb-6">
                <p className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {formError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tên khuyến mãi</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập tên khuyến mãi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mã khuyến mãi</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="VD: KM0001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phần trăm giảm giá (%)</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập phần trăm giảm giá"
                  />
                </div>
                {/* Replace the separate date fields with a single container */}
                <div className="space-y-2 md:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        showTimeSelect
                        dateFormat="dd/MM/yyyy HH:mm"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                      <DatePicker
                        selected={formData.endDate}
                        onChange={(date) => handleDateChange(date, 'endDate')}
                        showTimeSelect
                        dateFormat="dd/MM/yyyy HH:mm"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center h-full">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-sm font-medium text-gray-700">Kích hoạt khuyến mãi</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditMode(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      code: '',
                      discountPercentage: '',
                      startDate: new Date(),
                      endDate: new Date(),
                      isActive: true,
                    });
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isEditMode ? 'Cập nhật' : 'Thêm khuyến mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm khuyến mãi..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã KM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số sản phẩm</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((discount) => (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{discount.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{discount.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{discount.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discount.discountPercentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(discount.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(discount.endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {discount.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discount.productCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(discount)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filteredDiscounts.length > itemsPerPage && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-700">
                Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredDiscounts.length)} trong số {filteredDiscounts.length} khuyến mãi
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`px-3 py-1 rounded ${
                      currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;