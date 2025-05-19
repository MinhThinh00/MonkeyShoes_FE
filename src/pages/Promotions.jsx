import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaCalendar, FaTimes, FaCheck, FaTags, FaFilter } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, getPromotionById, filterPromotions } from '../helper/promotionHelper';
import { toast } from 'react-hot-toast';

// Component Dialog riêng để thêm/sửa khuyến mãi
const PromotionDialog = ({ isOpen, onClose, promotion, isEdit, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountPercentage: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    quantity: 0, // Thêm trường quantity
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (isEdit && promotion) {
      // Nếu là chế độ sửa và có dữ liệu promotion, điền vào form
      setFormData({
        name: promotion.name || '',
        code: promotion.code || '',
        discountPercentage: promotion.discountPercentage || '',
        startDate: new Date(promotion.startDate).toISOString().split('T')[0],
        endDate: new Date(promotion.endDate).toISOString().split('T')[0],
        isActive: promotion.active !== undefined ? promotion.active : true, // Thay đổi từ isActive thành active
        quantity: promotion.quantity || 0, // Thêm trường quantity
      });
    } else if (isEdit && promotion?.id) {
      fetchPromotionDetails(promotion.id);
    } else {
      // Nếu là chế độ thêm mới, reset form
      setFormData({
        name: '',
        code: '',
        discountPercentage: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        quantity: 0, // Thêm trường quantity
      });
    }
  }, [isEdit, promotion]);

  const fetchPromotionDetails = async (id) => {
    setLoading(true);
    try {
      const response = await getPromotionById(id, currentUser.token);
      if (response.success) {
        const promotionData = response.data;
        setFormData({
          name: promotionData.name || '',
          code: promotionData.code || '',
          discountPercentage: promotionData.discountPercentage || '',
          startDate: new Date(promotionData.startDate).toISOString().split('T')[0],
          endDate: new Date(promotionData.endDate).toISOString().split('T')[0],
          isActive: promotionData.active !== undefined ? promotionData.active : true, // Thay đổi từ isActive thành active
          quantity: promotionData.quantity || 0, // Thêm trường quantity
        });
      } else {
        toast.error('Không thể tải thông tin khuyến mãi');
      }
    } catch (error) {
      console.error('Error fetching promotion details:', error);
      toast.error('Đã xảy ra lỗi khi tải thông tin khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    if (formData.quantity < 0) {
      setFormError('Số lượng không thể là số âm');
      return;
    }

    // Gọi callback để lưu dữ liệu
    onSave(formData, isEdit ? promotion.id : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEdit ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                <p>{formError}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên khuyến mãi
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên khuyến mãi"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã khuyến mãi
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập mã khuyến mãi"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phần trăm giảm giá (%)
              </label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập phần trăm giảm giá"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng mã
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập số lượng mã khuyến mãi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Kích hoạt khuyến mãi</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isEdit ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Promotions = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  // Sử dụng state pagination đã tạo
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });

  const currentUser = useSelector((state) => state.user.currentUser);
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: ''
  });

  useEffect(() => {
    fetchDiscounts();
  }, [currentUser]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      if (!currentUser?.token) return;

      // Tạo đối tượng filters từ state filters
      const filterParams = {
        name: filters.name || '',
        startDate: filters.startDate ? `${filters.startDate}T00:00:00` : '',
        endDate: filters.endDate ? `${filters.endDate}T00:00:00` : '',
        isActive: filters.isActive === 'true' ? true :
          filters.isActive === 'false' ? false : '',
        page: Math.max(0, currentPage - 1),  // Đảm bảo page không âm
        size: itemsPerPage
      };

      const response = await filterPromotions(filterParams, currentUser.token);

      if (response.success) {
        setDiscounts(response.data.discount || []);

        // Cập nhật state pagination
        setPagination({
          currentPage: response.data.currentPage || 0,
          totalPages: response.data.totalPages || 0,
          totalItems: response.data.totalElements || 0
        });
      } else {
        toast.error('Không thể tải danh sách khuyến mãi');
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Đã xảy ra lỗi khi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };


  // Sửa lại hàm áp dụng bộ lọc
  const applyFilters = () => {
    setCurrentPage(1); // Reset về trang đầu tiên khi lọc
    fetchDiscounts();
  };

  const handleSavePromotion = async (formData, id) => {
    try {
      // Chuyển đổi dữ liệu form để phù hợp với API
      const apiData = {
        ...formData,
        startDate: `${formData.startDate}T00:00:00`,
        endDate: `${formData.endDate}T00:00:00`,
        active: formData.isActive, // Chuyển đổi từ isActive thành active
      };

      if (id) {
        // Cập nhật khuyến mãi
        const response = await updatePromotion(id, apiData, currentUser.token);
        console.log(response);
        if (response) {
          toast.success('Cập nhật khuyến mãi thành công');
          fetchDiscounts();
        } else {
          toast.error(response.message || 'Không thể cập nhật khuyến mãi');
        }
      } else {
        // Tạo khuyến mãi mới
        const response = await createPromotion(apiData, currentUser.token);
        console.log(response);
        if (response) {
          toast.success('Tạo khuyến mãi thành công');
          fetchDiscounts();
        } else {
          toast.error(response.message || 'Không thể tạo khuyến mãi');
        }
      }

      // Đóng dialog
      setDialogOpen(false);
      setSelectedPromotion(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Đã xảy ra lỗi khi xử lý yêu cầu');
    }
  };

  const handlePageChange = (newPage) => {
  

    // Tạo đối tượng filters từ state filters
    const filterParams = {
      name: filters.name || '',
      startDate: filters.startDate ? `${filters.startDate}T00:00:00` : '',
      endDate: filters.endDate ? `${filters.endDate}T00:00:00` : '',
      isActive: filters.isActive === 'true' ? true :
        filters.isActive === 'false' ? false : '',
      page: Math.max(0, newPage),
      size: itemsPerPage
    };

    // Gọi API với trang mới
    filterPromotions(filterParams, currentUser.token)
      .then(response => {
        if (response.success) {
          setDiscounts(response.data.discount || []);

          // Cập nhật state pagination thay vì setTotalPages
          setPagination({
            currentPage: response.data.currentPage || 0,
            totalPages: response.data.totalPages || 0,
            totalItems: response.data.totalElements || 0
          });
          setCurrentPage(newPage);
        } else {
          toast.error('Không thể tải danh sách khuyến mãi');
        }
      })
      .catch(error => {
        console.error('Error fetching discounts:', error);
        toast.error('Đã xảy ra lỗi khi tải danh sách khuyến mãi');
      });
  };


  const handleEdit = (discount) => {
    setSelectedPromotion(discount);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPromotion(null);
    setIsEditMode(false);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deletePromotion(id, currentUser.token);
      if (response.success) {
        toast.success('Xóa khuyến mãi thành công');
        fetchDiscounts();
      } else {
        toast.error(response.message || 'Không thể xóa khuyến mãi');
      }
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Đã xảy ra lỗi khi xóa khuyến mãi');
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Thêm hàm áp dụng bộ lọc
  // Remove this duplicate declaration
  // const applyFilters = () => {
  //   setCurrentPage(0); // Reset về trang đầu tiên khi lọc
  //   fetchPromotions();
  // };

  const clearFilters = () => {
    setFilters({
      name: '',
      startDate: '',
      endDate: '',
      isActive: ''
    });
    // Gọi lại API sau khi xóa bộ lọc
    setTimeout(() => {
      fetchDiscounts();
    }, 0);
  };


  // Filter discounts based on search term
  const filteredDiscounts = discounts ? discounts.filter(discount =>
    discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Quản lý các chương trình giảm giá và khuyến mãi</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Thêm khuyến mãi
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm khuyến mãi..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.name}
                onChange={(e) => handleFilterChange({ target: { name: 'name', value: e.target.value } })}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={toggleFilters}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </button>
          </div>

          {/* Bộ lọc mở rộng */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách khuyến mãi */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Danh sách khuyến mãi</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy khuyến mãi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khuyến mãi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{discount.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{discount.discountPercentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{discount.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${discount.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {discount.active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit className="inline mr-1" /> Sửa
                      </button>
                      <button
                        onClick={() => setConfirmDelete(discount.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline mr-1" /> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {pagination.currentPage + 1}/{pagination.totalPages}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog thêm/sửa khuyến mãi */}
      <PromotionDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedPromotion(null);
          setIsEditMode(false);
        }}
        promotion={selectedPromotion}
        isEdit={isEditMode}
        onSave={handleSavePromotion}
      />

      {/* Dialog xác nhận xóa */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
