import React, { useState, useEffect } from 'react';
// Import React Icons
import { FaPlus, FaCube, FaExclamationTriangle, FaInfoCircle, FaFolderOpen, FaSearch } from 'react-icons/fa';
// Import useNavigate
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchCategories, fetchStores, fetchProductsByStore } from '../helper/productApi';
import { useSelector } from 'react-redux';

function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Add pagination state
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });
  const currentUser = useSelector((state) => state.user.currentUser);
  
  const navigate = useNavigate();
  
  // Fetch stores and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.token) {
          // Fetch stores
          const storesData = await fetchStores(currentUser.token);
          setStores(storesData);
          
          // Fetch products for the default store (ID: 1)
          fetchProductsByStore(selectedStore);
          
          // Fetch categories
          const categoriesData = await fetchCategories();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Function to fetch products by store ID
  const fetchProductsForStore = async (storeId, page = 0) => {
    setLoading(true);
    try {
      const response = await fetchProductsByStore(storeId, page);
      console.log('Products data:', response.data);
      const productsData = response?.data.data.products || [];
      setProducts(productsData);
      // Update pagination state
      setPagination({
        currentPage: response.data.data.currentPage,
        totalPages: response.data.data.totalPages,
        totalItems: response.data.data.totalItems
      });
      return response;
    } catch (error) {
      console.error('Error fetching products by store:', error);
      setProducts([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add pagination handlers
  const handlePrevPage = () => {
    if (pagination.currentPage > 0) {
      fetchProductsForStore(selectedStore, pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages - 1) {
      fetchProductsForStore(selectedStore, pagination.currentPage + 1);
    }
  };
  
  // Update the useEffect to use this function
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser?.token) {
          const storesData = await fetchStores(currentUser.token);
          setStores(storesData);
          
          fetchProductsForStore(selectedStore);
          const categoriesData = await fetchCategories();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Update the handleStoreChange function
  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    setSelectedStore(storeId);
    fetchProductsForStore(storeId);
  };
  
  const handleAddProductClick = () => {
    navigate('/dashboard/products/add');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>
        {/* Add onClick handler to the button */}
        <button
          onClick={handleAddProductClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          {/* Replace SVG with FaPlus */}
          <FaPlus className="h-5 w-5 mr-2" />
          Thêm sản phẩm
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tổng sản phẩm</h3>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <FaCube className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{pagination.totalItems}</p>
          <p className="text-sm text-gray-500 mt-1">Sản phẩm</p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Hết hàng</h3>
            <span className="p-2 bg-red-50 text-red-600 rounded-full">
              {/* Replace SVG with FaExclamationTriangle */}
              <FaExclamationTriangle className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">0</p>
          <p className="text-sm text-gray-500 mt-1">Sản phẩm</p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Sắp hết hàng</h3>
            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-full">
              {/* Replace SVG with FaInfoCircle */}
              <FaInfoCircle className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">0</p>
          <p className="text-sm text-gray-500 mt-1">Sản phẩm</p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Danh mục</h3>
            <span className="p-2 bg-green-50 text-green-600 rounded-full">
              {/* Replace SVG with FaFolderOpen */}
              <FaFolderOpen className="h-5 w-5" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">0</p>
          <p className="text-sm text-gray-500 mt-1">Danh mục</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Danh sách sản phẩm</h3>
          <div className="flex space-x-2">
            {/* Add store filter */}
            <select 
              value={selectedStore}
              onChange={handleStoreChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </span>
              <input type="text" placeholder="Tìm sản phẩm..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <select className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phân Loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  số lượng màu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr className="text-center">
                  <td colSpan="6" className="px-6 py-12 text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr className="text-center">
                  <td colSpan="6" className="px-6 py-12 text-gray-500">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={product.images?.find(img => img.default)?.imageURL || 
                                 product.images?.[0]?.imageURL || 
                                 'https://via.placeholder.com/40'} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {/* <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.basePrice?.toLocaleString('vi-VN')} đ</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.totalQuantity || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Set(product.options
                          .filter(option => option.optionName === 'Màu sắc')
                          .map(option => option.value)).size} màu
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {products.length} trên tổng {pagination.totalItems} sản phẩm (Trang {pagination.currentPage + 1}/{pagination.totalPages})
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevPage}
              disabled={pagination.currentPage === 0}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Trước
            </button>
            <button 
              onClick={handleNextPage}
              disabled={pagination.currentPage === pagination.totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;