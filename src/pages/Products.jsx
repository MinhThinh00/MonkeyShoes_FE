import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useLocation } from 'react-router-dom';
import { FaFilter, FaTimes, FaSort } from 'react-icons/fa';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ProductCard from '../components/ProductCard/ProductCard';
import {
  getAllProducts,
  getProductByType,
} from '../helper/getProductFromApi';
import axios from 'axios';

const Products = () => {
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

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'id',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '0')
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters, category, location.pathname]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Add this state to track page transitions
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Modify fetchProducts to handle page transitions
  const fetchProducts = async () => {
    if (!isPageTransitioning) {
      setLoading(true);
    }
    try {
      let data = [];
      let paginationData = {
        currentPage: filters.page || 0,
        totalPages: 0,
        totalItems: 0
      };
      const currentFilters = { ...filters };
      const apiFilters = {};
      for (const key in currentFilters) {
        if (currentFilters[key]) {
          apiFilters[key] = currentFilters[key];
        }
      }
      if (category) {
        const groupMap = {
          'men': 'NAM',
          'women': 'NU',
          'kids': 'TRE_EM'
        };

        const group = groupMap[category.toLowerCase()];

        if (group) {
          try {
            const response = await axios.get(`http://localhost:8080/api/products/group/${group}`, {
              params: {
                page: filters.page || 0,
                size: 1,
                ...apiFilters
              }
            });
            console.log("Response data for group:", response);
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
            // Add pagination extraction for each condition
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
            } else if (response.data && response.data.content) {
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
            } else {
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
            console.error("Error fetching category products:", error);
          }
        }
      }

      else if (Object.keys(apiFilters).length > 0 && apiFilters.type && Object.keys(apiFilters).length === 1) {
        try {
          const result = await getProductByType(apiFilters.type);
          // Check if the result has the products field
          if (result && result.products) {
            data = result.products;
          } else {
            data = result || [];
          }
        } catch (error) {
          console.error("Error fetching products by type:", error);
        }
      } else if (Object.keys(apiFilters).length > 0) {
        // Implement filtered products
        try {
          const response = await axios.get(`http://localhost:8080/api/products`, {
            params: {
              ...apiFilters,
              page: 0,
              size: 1
            }
          });
          if (response.data && response.data.products) {
            data = response.data.products;
          } else if (response.data && response.data.content) {
            data = response.data.content;
          } else if (Array.isArray(response.data)) {
            data = response.data;
          }
        } catch (error) {
          console.error("Error fetching filtered products:", error);
        }
      } else {
        try {
          const result = await getAllProducts();
          // Check if the result has the products field
          if (result && result.products) {
            data = result.products;
          } else {
            data = result || [];
          }
        } catch (error) {
          console.error("Error fetching all products:", error);
        }
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

  // Update handlePageChange to handle transitions
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages && newPage !== pagination.currentPage) {
      setIsPageTransitioning(true);
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />

      <main className="flex-grow container mx-auto px-4 py-8">
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
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative min-h-[400px]">
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