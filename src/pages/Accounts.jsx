import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye, FaUserShield, FaTimes } from 'react-icons/fa';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [formError, setFormError] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        // Mock data
        const roles = ['Admin', 'Manager', 'Staff', 'User'];
        const mockAccounts = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: roles[Math.floor(Math.random() * roles.length)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
          lastLogin: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
          status: Math.random() > 0.2 ? 'Active' : 'Inactive'
        }));
        
        setTimeout(() => {
          setAccounts(mockAccounts);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Filter accounts based on search term
  // Add a new state for role filtering
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Update the filteredAccounts to include role filtering
  const filteredAccounts = accounts.filter(account => 
    (account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     account.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || account.role.toLowerCase() === roleFilter.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

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
      username: account.username,
      email: account.email,
      password: '',
      confirmPassword: '',
      role: account.role.toLowerCase()
    });
    setShowAddForm(true);
  };
  
  // Update handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
  
    if (!newAccount.username || !newAccount.email) {
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
  
    if (isEditMode) {
      // Update existing account
      const updatedAccounts = accounts.map(account => 
        account.id === editingId 
          ? { 
              ...account, 
              username: newAccount.username,
              email: newAccount.email,
              role: newAccount.role,
            } 
          : account
      );
      setAccounts(updatedAccounts);
    } else {
      // Add new account
      const newAccountData = {
        id: accounts.length + 1,
        username: newAccount.username,
        email: newAccount.email,
        role: newAccount.role,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        status: 'Active'
      };
      setAccounts([...accounts, newAccountData]);
    }
    
    // Reset form and close
    setShowAddForm(false);
    setIsEditMode(false);
    setEditingId(null);
    setNewAccount({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    });
    setFormError('');
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
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'user'
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
                    name="username"
                    value={newAccount.username}
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nhập lại mật khẩu"
                    required={!isEditMode}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quyền</label>
                  <select
                    name="role"
                    value={newAccount.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
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
                      username: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      role: 'user'
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
              placeholder="Tìm kiếm theo tên, email, quyền..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Role filter dropdown */}
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả quyền</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
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
                  {currentItems.length > 0 ? (
                    currentItems.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{account.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{account.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${account.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                              account.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 
                              account.role === 'Staff' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {account.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(account.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Remove the eye/view button and keep only edit and delete */}
                            <button 
                              onClick={() => handleEdit(account)} 
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
            {filteredAccounts.length > itemsPerPage && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredAccounts.length)} trong số {filteredAccounts.length} tài khoản
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
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