import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import UserDetailDialog from '../components/UserDetailDialog';

const Customers = () => {
  const baseURL = import.meta.env.VITE_API_URI;
  const currentUser = useSelector((state) => state.user.currentUser);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(2); // Match with backend pagination size
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Update the useEffect to include searchTerm in dependencies
  // Split into two separate useEffects - one for pagination and one for search
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        if (!currentUser || !currentUser.token) {
          console.error('User not authenticated');
          setLoading(false);
          return;
        }
        
        // Regular API for initial load and pagination (without search)
        if (!searchTerm) {
          const response = await fetch(`${baseURL}/users?page=${currentPage}&size=${itemsPerPage}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser.token}`  
            }
          });
          
          const result = await response.json();
          
          if (result.success) {
            setCustomers(result.data.users);
            setTotalPages(result.data.totalPages);
            setTotalItems(result.data.totalItems);
          } else {
            console.error('Error fetching customers:', result.message);
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when not searching
    if (!searchTerm) {
      fetchCustomers();
    }
  }, [currentPage, itemsPerPage, baseURL, currentUser, searchTerm]);

  // Separate useEffect for search functionality with debounce
  useEffect(() => {
    // Don't search if search term is empty#
    if (!searchTerm) return;
    
    const searchCustomers = async () => {
      setLoading(true);
      try {
        if (!currentUser || !currentUser.token) {
          console.error('User not authenticated');
          setLoading(false);
          return;
        }
        
        // Use the correct search API endpoint
        const response = await fetch(`${baseURL}/users/search?name=${searchTerm}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`  
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCustomers(result.data.users);
          setTotalPages(result.data.totalPages || 1);
          setTotalItems(result.data.totalItems || result.data.users.length);
        } else {
          console.error('Error searching customers:', result.message);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to avoid too many API calls while typing
    const timeoutId = setTimeout(() => {
      searchCustomers();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, baseURL, currentUser]);

  // Update the search input to reset page when searching
  <div className="relative flex-1">
    <input
      type="text"
      placeholder="Tìm kiếm theo tên, email..."
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        // Reset to first page when searching
        setCurrentPage(0);
      }}
    />
    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
  </div>

  // Filter customers based on search term
  // Remove this client-side filtering code
  // const filteredCustomers = customers.filter(customer => 
  //   (customer.userName && customer.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //   (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  // );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý khách hàng</h1>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Reset to first page when searching
                setCurrentPage(0);
              }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Customers table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{customer.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{customer.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.roleName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {customer.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.createAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleViewCustomer(customer)} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEye className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Không tìm thấy khách hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Hiển thị trang {currentPage + 1} trong số {totalPages} trang (Tổng {totalItems} khách hàng)
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => paginate(currentPage > 0 ? currentPage - 1 : 0)}
                    disabled={currentPage === 0}
                    className={`px-3 py-1 rounded ${currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage < totalPages - 1 ? currentPage + 1 : totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`px-3 py-1 rounded ${currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Dialog */}
      {selectedCustomer && (
        <UserDetailDialog 
          user={selectedCustomer} 
          onClose={handleCloseDialog} 
          token={currentUser?.token}
        />
      )}
    </div>
  );
};

export default Customers;