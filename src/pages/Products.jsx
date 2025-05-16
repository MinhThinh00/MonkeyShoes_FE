import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { FaFilter, FaTimes, FaSort, FaStore } from 'react-icons/fa';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ProductCard from '../components/ProductCard/ProductCard';

import axios from 'axios';

const Products = () => {

  const baseURL = import.meta.env.VITE_API_URI;

  const [storeId, setStoreId] = useState(1);
  const [stores, setStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
    
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });
  const params = useParams(); 
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const category = pathSegments.length > 1 ? pathSegments[1] : null;

  console.log("Current category:", category);

  useEffect(() => {
    const storedStoreId = localStorage.getItem('selectedStore');
    if (storedStoreId) {
      setStoreId(parseInt(storedStoreId));
      fetchStoreDetails(parseInt(storedStoreId));
    } else {
      // Nếu chưa có store được chọn, sử dụng mặc định là 1
      setStoreId(1);
      localStorage.setItem('selectedStore', '1');
      fetchStoreDetails(1);
    }
    
    // Lấy danh sách cửa hàng
    fetchStores();
  }, []);
  
  // Hàm để lấy danh sách cửa hàng
  const fetchStores = async () => {
    try {
      const response = await axios.get('http://localhost:8169/api/store');
      setStores(response.data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      
    }
  };

  // Hàm để lấy thông tin chi tiết của cửa hàng
  const fetchStoreDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8169/api/store/${id}`);
      setCurrentStore(response.data);
    } catch (error) {
      console.error('Error fetching store details:', error);
      // Nếu không lấy được thông tin cửa hàng, tạo thông tin mặc định
      const defaultStore = stores.find(store => store.id === id) || { id, name: `Cửa hàng ${id}` };
      setCurrentStore(defaultStore);
    }
  };

  // Hàm xử lý khi người dùng chọn cửa hàng
  const handleStoreSelect = (id) => {
    setStoreId(id);
    localStorage.setItem('selectedStore', id);
    setShowStoreSelector(false);
    fetchStoreDetails(id);
    
    // Đảm bảo storeId được cập nhật trước khi gọi fetchProducts
    setTimeout(() => {
      fetchProducts(id); // Truyền id trực tiếp vào fetchProducts
    }, 100);
  };
  
  // Khởi tạo filters từ URL params
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'id',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '0')
  });

// Add this function to handle filter changes
const handleFilterChange = (e) => {
  const { name, value } = e.target;
  console.log(`Filter changed: ${name} = ${value}`);
  
  setFilters(prev => ({
    ...prev,
    [name]: value,
    page: 0 // Reset page when filters change
  }));
  
  // Không cập nhật URL search params và không gọi fetchProducts ngay lập tức
  // Việc này sẽ được thực hiện khi nhấn nút "Áp dụng"
};

const applyFilters = () => {
  // Log params trước khi áp dụng
  console.log("Applying filters:", filters);
  
  // Reset page when applying new filters
  setFilters(prev => ({
    ...prev,
    page: 0
  }));
  
  // Update URL search params with current filters
  const newSearchParams = new URLSearchParams();
  
  // Đảm bảo tất cả các tham số đều được thêm vào URL, kể cả khi chúng trống
  newSearchParams.set('search', filters.search || '');
  newSearchParams.set('type', filters.type || '');
  newSearchParams.set('minPrice', filters.minPrice || '');
  newSearchParams.set('maxPrice', filters.maxPrice || '');
  newSearchParams.set('sort', filters.sort || '');
  newSearchParams.set('page', filters.page || 0);
  newSearchParams.set('size', 4); // Sử dụng kích thước mặc định là 4
  
  setSearchParams(newSearchParams);
  
  // Fetch products with updated filters
  fetchProducts();
  
  // Đóng panel filter sau khi áp dụng
  setShowFilters(false);
};

const clearFilters = () => {
  console.log("Clearing all filters");
  
  setFilters({
    type: '',
    minPrice: '',
    maxPrice: '',
    sort: 'id',
    search: '',
    page: 0
  });
  
  // Clear URL search params
  setSearchParams({});
  
  // Fetch products with cleared filters
  fetchProducts();
};

// Sửa useEffect để chỉ gọi fetchProducts khi URL thay đổi hoặc khi component mount
useEffect(() => {
  console.log("URL params changed, fetching products");
  fetchProducts();
  fetchCategories();
}, [searchParams, category, location.pathname]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8169/api/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Add this state to track page transitions
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Modify fetchProducts to handle page transitions
  const fetchProducts = async (selectedStoreId) => {
    // Sử dụng selectedStoreId nếu được truyền vào, nếu không thì sử dụng storeId từ state
    const currentStoreId = selectedStoreId || storeId;
    console.log("Fetching products for store ID:", currentStoreId);
    
    // Chỉ hiển thị loading khi không phải là chuyển trang
    // và khi không có dữ liệu sẵn có
    if (!isPageTransitioning && products.length === 0) {
      setLoading(true);
    }
    
    try {
      let data = [];
      let paginationData = {
        currentPage: filters.page || 0,
        totalPages: 0,
        totalItems: 0
      };
      
      // Lấy giá trị page từ URL search params nếu có
      const pageFromURL = parseInt(searchParams.get('page') || '0');
      
      // Đảm bảo tất cả các tham số đều được gửi đến API, kể cả khi chúng trống
      const apiFilters = {
        search: filters.search || '',
        type: filters.type || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        sort: filters.sort || 'id-asc',
        page: pageFromURL, // Sử dụng giá trị từ URL
        size: 4
      };
      
      // Xác định group dựa trên category nếu có
      if (category) {
        const groupMap = {
          'men': 'NAM',
          'women': 'NU',
          'kids': 'TRE_EM'
        };
      
        const group = groupMap[category.toLowerCase()];
        if (group) {
          apiFilters.group = group;
        }
      }
      
      try {
        // Sử dụng API tìm kiếm cho tất cả các trường hợp
        const response = await axios.get(`http://localhost:8169/api/products/store/${currentStoreId}/search`, {
          params: apiFilters
        });
        
        console.log("API response:", response);
        
        // Xử lý dữ liệu phản hồi
        if (response.data && response.data.data && response.data.data.products) {
          data = response.data.data.products;
          if (response.data.data.totalPages) {
            paginationData = {
              currentPage: response.data.data.currentPage || 0,
              totalPages: response.data.data.totalPages,
              totalItems: response.data.data.totalItems || data.length
            };
          }
        }
        else if (response.data && response.data.products) {
          data = response.data.products;
          if (response.data.totalPages) {
            paginationData = {
              currentPage: response.data.number || 0,
              totalPages: response.data.totalPages || 1,
              totalItems: response.data.totalElements || data.length
            };
          }
          console.log("Found products in response.data.products:", data.length);
        } 
        else if (response.data && response.data.content) {
          data = response.data.content;
          // Spring Boot pagination format
          paginationData = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.totalElements || data.length
          };
          console.log("Found products in response.data.content:", data.length);
        }
        else if (Array.isArray(response.data)) {
          data = response.data;
          console.log("Response data is an array:", data.length);
        } 
        else {
          console.log("Detailed response structure:", JSON.stringify(response.data, null, 2));
          if (response.data && typeof response.data === 'object') {
            // Look for an array property that might contain products
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                console.log(`Found array in response.data.${key}:`, response.data[key].length);
                data = response.data[key];
                break;
              } else if (response.data[key] && typeof response.data[key] === 'object') {
                for (const nestedKey in response.data[key]) {
                  if (Array.isArray(response.data[key][nestedKey])) {
                    console.log(`Found array in response.data.${key}.${nestedKey}:`, response.data[key][nestedKey].length);
                    data = response.data[key][nestedKey];
                    break;
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      
      setProducts(data || []);
      setPagination(paginationData); // Set the pagination state
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setIsPageTransitioning(false);
    }
  };

  // Update handlePageChange to handle transitions better
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages && newPage !== pagination.currentPage) {
      // Đặt trạng thái chuyển trang trước khi thực hiện bất kỳ thay đổi nào
      setIsPageTransitioning(true);
      
      // Cập nhật filters
      setFilters(prev => ({ ...prev, page: newPage }));
      
      // Cập nhật URL search params
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', newPage);
      setSearchParams(newSearchParams);
      
      // Không cần gọi fetchProducts ở đây vì useEffect sẽ kích hoạt nó
      // khi searchParams thay đổi
    }
  };

  // Xử lý tìm kiếm từ Header
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 0 // Reset trang khi tìm kiếm
    }));
    
    // Cập nhật URL search params và gọi fetchProducts ngay lập tức
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('search', searchTerm || '');
    newSearchParams.set('type', filters.type || '');
    newSearchParams.set('minPrice', filters.minPrice || '');
    newSearchParams.set('maxPrice', filters.maxPrice || '');
    newSearchParams.set('sort', filters.sort || '');
    newSearchParams.set('page', 0);
    newSearchParams.set('size', 4);
    
    setSearchParams(newSearchParams);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Store Selector */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaStore className="text-blue-600 mr-2" />
              <span className="text-gray-700">
                Bạn đang xem sản phẩm tại: <span className="font-semibold">{currentStore ? currentStore.name : `Cửa hàng ${storeId}`}</span>
              </span>
            </div>
            <button 
              onClick={() => setShowStoreSelector(!showStoreSelector)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Thay đổi
            </button>
          </div>
          
          {/* Store Selection Dropdown */}
          {showStoreSelector && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Chọn cửa hàng:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {stores.map(store => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreSelect(store.id)}
                    className={`text-left px-3 py-2 rounded-md transition-colors ${
                      store.id === storeId 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {filters.type ? `Sản phẩm ${filters.type}` : 'Tất cả sản phẩm'}
              {filters.search && ` (Kết quả tìm kiếm cho "${filters.search}")`}
            </h1>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Ẩn bộ lọc' : 'Lọc sản phẩm'}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 transition-all">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Bộ lọc sản phẩm</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Type Filter - Updated to use categories from API */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tất cả</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá từ</label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="VNĐ"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Max Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến</label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="VNĐ"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="basePrice-asc">Giá tăng dần</option>
                    <option value="basePrice-desc">Giá giảm dần</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(filters.type || filters.minPrice || filters.maxPrice || (filters.sort && filters.sort !== 'id')) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>

              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Loại: {filters.type}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {filters.minPrice && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Giá từ: {filters.minPrice}đ
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, minPrice: '' }))}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {filters.maxPrice && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Giá đến: {filters.maxPrice}đ
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, maxPrice: '' }))}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              {filters.sort && filters.sort !== 'id' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Sắp xếp: {filters.sort === 'price-asc' ? 'Giá tăng dần' :
                    filters.sort === 'price-desc' ? 'Giá giảm dần' :
                      filters.sort === 'name-asc' ? 'Tên A-Z' : 'Tên Z-A'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sort: 'id' }))}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Products Display */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
              {isPageTransitioning && (
                <div className="absolute inset-0 bg-white/50 flex justify-center items-center z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              {products.map((product) => (
                <div 
                  key={product.id || product._id} 
                  className="transition-opacity duration-300 ease-in-out"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className={`px-3 py-1 mx-1 rounded ${
                      pagination.currentPage === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    &laquo; Trước
                  </button>

                  {/* Page Buttons */}
                  {Array.from({ length: pagination.totalPages }, (_, page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 mx-1 rounded ${
                        pagination.currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className={`px-3 py-1 mx-1 rounded ${
                      pagination.currentPage >= pagination.totalPages - 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Tiếp &raquo;
                  </button>
                </nav>
              </div>
            )}

          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;


