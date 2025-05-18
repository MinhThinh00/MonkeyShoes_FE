import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye, FaUserShield, FaTimes } from 'react-icons/fa';
import { fetchStores } from '../helper/productApi'; // Import fetchStores function
import { useSelector } from 'react-redux';
import { adminCreateAccount, updateAccount,getStaffAccounts } from '../helper/accountHelper';
import { toast } from 'react-hot-toast';

const Accounts = () => {

  const currentUser = useSelector((state) => state.user.currentUser);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState('all'); // Move this up
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
    storeId: '' 
  });
  const [formError, setFormError] = useState('');
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  // Update state variables
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser?.token) {
          console.error('User not authenticated');
          return;
        }
        
        // Load stores data regardless of search
        const storesData = await fetchStores(currentUser.token);
        setStores(storesData);
        
        // Only fetch accounts if not searching - use the staff API endpoint
        if (!searchTerm && (roleFilter === 'all' || !roleFilter)) {
          setLoading(true);
          // Fix: Subtract 1 from currentPage since API uses 0-based indexing
          const response = await getStaffAccounts(currentUser.token, currentPage - 1);
          setAccounts(response.data.staff);
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.totalItems);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, currentPage]);
  
  // Separate useEffect for search and filter functionality
  useEffect(() => {
    // Modified condition to ensure search runs when role filter changes
    // We need to track if the filter was just changed to 'all'
    const isSearching = searchTerm || roleFilter !== 'all';
    
    // If nothing to search for and we're not explicitly filtering, don't search
    if (!isSearching) {
      // When switching back to 'all', we should reload the default data
      if (roleFilter === 'all') {
        const fetchDefaultData = async () => {
          try {
            if (!currentUser?.token) return;
            setLoading(true);
            const response = await getStaffAccounts(currentUser.token, 0); // First page
            setAccounts(response.data.staff);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalItems);
            setCurrentPage(1);
          } catch (error) {
            console.error('Error fetching default data:', error);
          } finally {
            setLoading(false);
          }
        };
        
        fetchDefaultData();
      }
      return;
    }
    
    // Rest of the search function remains the same
    const searchAccounts = async () => {
      setLoading(true);
      try {
        if (!currentUser?.token) {
          console.error('User not authenticated');
          setLoading(false);
          return;
        }
        
        // Use the search API endpoint with the correct parameters
        const baseURL = import.meta.env.VITE_API_URI;
        let searchUrl = `${baseURL}/users/search?`;
        
        // Add search parameters if they exist
        if (searchTerm) {
          searchUrl += `name=${searchTerm}`;
        }
        
        // Add role filter if it's not 'all' - don't include role parameter when 'all' is selected
        if (roleFilter !== 'all') {
          searchUrl += searchTerm ? `&role=${roleFilter}` : `role=${roleFilter}`;
        }
        
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setAccounts(result.data.users || []);
          setTotalPages(result.data.totalPages || 1);
          setTotalItems(result.data.totalItems || (result.data.users?.length || 0));
          // Reset current page to 1 in the UI (1-based)
          setCurrentPage(1);
        } else {
          console.error('Error searching accounts:', result.message);
        }
      } catch (error) {
        console.error('Error searching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchAccounts();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, currentUser]);
  
  // Update pagination sectio
  //const [roleFilter, setRoleFilter] = useState('all');
  
  // Update the filteredAccounts to include role filtering
  // Remove this client-side filtering code
  // const filteredAccounts = accounts.filter(account => 
  //   (account.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //    account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //    (account.role?.toLowerCase() || account.roleName?.toLowerCase() || '').includes(searchTerm.toLowerCase())) &&
  //   (roleFilter === 'all' || (account.role?.toLowerCase() || account.roleName?.toLowerCase() || '') === roleFilter.toLowerCase())
  // );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount({
      ...newAccount,
      [name]: value
    });
  };

  // Handle form submission
  // Add these state variables at the top with other states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Add handleEdit function before the return statement
  const handleEdit = (account) => {
    setIsEditMode(true);
    setEditingId(account.id);
    setNewAccount({
      userName: account.userName,
      email: account.email,
      password: '',
      confirmPassword: '',
      role: account.roleName,  // Changed from account.role to account.roleName
      storeId: account.storeId || ''  // Added storeId
    });
    setShowAddForm(true);
  };
  
  // Update handleSubmit function
  const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError('');
    
      try {
        if (!newAccount.userName || !newAccount.email) {
          setFormError('Vui lòng điền đầy đủ thông tin');
          return;
        }
      
        if (!isEditMode && (!newAccount.password || !newAccount.confirmPassword)) {
          setFormError('Vui lòng điền mật khẩu');
          return;
        }
      
        if (newAccount.password !== newAccount.confirmPassword) {
          setFormError('Mật khẩu xác nhận không khớp');
          return;
        }
  
        if (newAccount.role === 'STAFF' && !newAccount.storeId) {
          setFormError('Vui lòng chọn cửa hàng cho nhân viên');
          return;
        }
      
      const accountData = {
        userName: newAccount.userName,
        email: newAccount.email,
        password: newAccount.password, // Always include password in the data
        role: newAccount.role,
        storeId: newAccount.storeId || null
      };
  
      if (!isEditMode) {
        accountData.password = newAccount.password;
      }
    
      if (isEditMode) {
        await updateAccount(editingId, accountData, currentUser.token);
        toast.success('Cập nhật tài khoản thành công!');
      } else {
        await adminCreateAccount(accountData, currentUser.token);
        toast.success('Tạo tài khoản mới thành công!');
      }
      
      // Reset form and close
      setShowAddForm(false);
      setIsEditMode(false);
      setEditingId(null);
      setNewAccount({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STAFF',
        storeId: ''
      });
      setFormError('');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
      setFormError(error.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> {showAddForm ? 'Đóng form' : 'Thêm tài khoản'}
        </button>
      </div>

      {/* Modal Form - ensure it's centered */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg max-w-3xl w-full mx-auto p-8 shadow-xl">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewAccount({
                    userName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'STAFF'
                  });
                  setFormError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            
            {/* Rest of the form remains unchanged */}
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                  <input
                    type="text"
                    name="userName"
                    value={newAccount.userName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newAccount.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={newAccount.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập mật khẩu"
                    required={!isEditMode}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newAccount.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      newAccount.confirmPassword && newAccount.password !== newAccount.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                    required={!isEditMode}
                  />
                  {newAccount.confirmPassword && newAccount.password !== newAccount.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Mật khẩu không khớp</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quyền</label>
                  <select
                    name="role"
                    value={newAccount.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {/* Add Store Selection */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                  <select
                    name="storeId"
                    value={newAccount.storeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required={newAccount.role === 'STAFF'}
                  >
                    <option value="">Chọn cửa hàng</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setIsEditMode(false);
                    setEditingId(null);
                    setNewAccount({
                      userName: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      role: 'STAFF'
                    });
                    setFormError('');
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isEditMode ? 'Cập nhật' : 'Thêm tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Reset happens in the search useEffect
              }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Role filter dropdown */}
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                // Reset happens in the search useEffect
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả quyền</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
               
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accounts.length > 0 ? (
                      accounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{account.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{account.userName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${account.roleName === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                // account.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 
                                account.roleName === 'STAFF' ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {account.roleName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(account.createAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${account.isActive? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {account.isActive? 'Hoạt động' : 'Khóa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {/* Remove the eye/view button and keep only edit and delete */}
                              {currentUser.userId != account.id &&(
                                <>
                                <button 
                                onClick={() => handleEdit(account)} 
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <FaEdit className="h-5 w-5" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <FaTrash className="h-5 w-5" />
                              </button>
                              </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Không tìm thấy tài khoản nào
                        </td>
                      </tr>
                    )}
                  </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Hiển thị {accounts.length} trong số {totalItems} tài khoản
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Accounts;
