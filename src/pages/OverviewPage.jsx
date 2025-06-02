import React, { useState, useEffect } from 'react';
// Import React Icons
import { FaShoppingBag, FaDollarSign, FaCube, FaUsers, FaCalendarAlt } from 'react-icons/fa'; 
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getYearlyRevenueReport, getMonthlyCategoryRevenueReport,getTopProductsByStore, formatCurrency, formatCompactCurrency,getSummaryReport } from '../helper/reportHelper';
import { Link } from 'react-router-dom';

function OverviewPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [revenueData, setRevenueData] = useState({ data: [] });
  const [categoryData, setCategoryData] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [topProductsData, setTopProductsData] = useState({ data: [] });
  const [reportSummary,setReportSummary] = useState();
  // Get current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // JavaScript months are 0-indexed
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Colors for pie chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Fetch revenue data when component mounts
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const data = await getYearlyRevenueReport(selectedYear, currentUser.token);
        console.log('Fetched revenue data:', data);
        setRevenueData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRevenueData();
  }, [currentUser, selectedYear]);

  useEffect(() => {
    const fetchTopProductsData = async () => {
      try {
        const data = await getTopProductsByStore(selectedMonth, selectedYear, currentUser.token);
        console.log('Fetched top products data:', data);
        setTopProductsData(data);
        console.log('Fetched top products data:', topProductsData);
      } catch (err) {
        console.error('Error fetching top products data:', err);
      } finally {
        // setTopProductsLoading(false);
      }
    };
    const fetchReportSummary = async () => {
      try {
        const data = await getSummaryReport( currentUser.token);
        console.log('Fetched top products data:', data);
        setReportSummary(data);
        console.log('Fetched Report Summary:', reportSummary);
      } catch (err) {
        console.error('Error fetching top products data:', err);
      } finally {
        // setTopProductsLoading(false);
      }
    }
    fetchReportSummary();
    fetchTopProductsData();
    console.log('Fetched top products data:', topProductsData);
    console.log('Fetched Report Summary:', reportSummary);
  }, [currentUser, selectedMonth, selectedYear]);

  // Fetch category data when month or year changes
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setCategoryLoading(true);
        const data = await getMonthlyCategoryRevenueReport(selectedMonth, selectedYear, currentUser.token);
        console.log('Fetched category data:', data);
        setCategoryData(data);
        setCategoryError(null);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setCategoryError('Failed to load category data');
      } finally {
        setCategoryLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [currentUser, selectedMonth, selectedYear]);

  // Transform data for Recharts
  const transformedData = revenueData.data?.map(item => {
    const storeNames = Object.keys(item.storeRevenues || {});
    const result = { name: item.name };
    
    storeNames.forEach(storeName => {
      result[storeName] = item.storeRevenues[storeName];
    });
    
    return result;
  }) || [];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie charts
  const PieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded">
          <p className="font-semibold">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Generate month options
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  // Generate year options (current year and 4 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Find store data for pie charts
  const getStoreData = (storeName) => {
    if (!categoryData.data || categoryData.data.length === 0) return [];
    
    const storeData = categoryData.data.find(item => Object.keys(item)[0] === storeName);
    return storeData ? storeData[storeName] : [];
  };

  // Get store names from category data
  const getStoreNames = () => {
    if (!categoryData.data || categoryData.data.length === 0) return [];
    return categoryData.data.map(item => Object.keys(item)[0]);
  };

  const storeNames = getStoreNames();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Xem tổng quan về hoạt động kinh doanh của bạn</p>
      </div>
      
      {/* Stats cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <FaShoppingBag className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Đơn hàng</h2>
              <p className="font-bold text-2xl text-gray-800">{reportSummary?.totalOrders || 0}</p>
            </div>
          </div>
          {/* <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Hôm nay</span>
              <span className="text-xs font-medium text-green-600">+0%</span>
            </div>
          </div> */}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <FaDollarSign className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Doanh thu</h2>
              <p className="font-bold text-2xl text-gray-800">{formatCurrency(reportSummary?.totalRevenue) || '0₫'}</p>
            </div>
          </div>
          {/* <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tháng này</span>
              <span className="text-xs font-medium text-green-600">+0%</span>
            </div>
          </div> */}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <FaCube className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Sản phẩm đã bán</h2>
              <p className="font-bold text-2xl text-gray-800">{reportSummary?.totalProductsSold || 0}</p>
            </div>
          </div>
          {/* <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tổng số</span>
              <Link  className="text-xs font-medium text-blue-600">Xem tất cả</Link>
            </div>
          </div> */}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600">
              <FaUsers className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-600 text-sm">Khách hàng</h2>
              <p className="font-bold text-2xl text-gray-800">{reportSummary?.totalCustomers || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tổng số</span>
              <Link to="/dashboard/customers" className="text-xs font-medium text-blue-600">Xem tất cả</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Doanh thu gần đây ({selectedYear})</h3>
          </div>
          <div className="p-6 h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500">{error}</p>
              </div>
            ) : transformedData.some(item => {
              // Check if any store has revenue > 0
              return Object.keys(item)
                .filter(key => key !== 'name')
                .some(key => item[key] > 0);
            }) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(transformedData[0] || {})
                    .filter(key => key !== 'name')
                    .map((storeName, index) => (
                      <Bar 
                        key={storeName} 
                        dataKey={storeName} 
                        fill={index === 0 ? "#4F46E5" : "#10B981"} 
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Chưa có dữ liệu doanh thu</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Orders section */}
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Đơn hàng gần đây</h3>
          </div>
          <div className="p-6 flex items-center justify-center h-64">
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        </div>
      </div>
      
      {/* Pie Charts Section with Time Selection */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="font-semibold text-gray-800 mb-2 md:mb-0">Doanh thu theo danh mục</h3>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Chọn thời gian:</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <select 
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select 
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {storeNames.length > 0 ? (
          storeNames.map((storeName, index) => (
            <div key={storeName} className="bg-white rounded-lg shadow border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">{storeName}</h3>
                <p className="text-sm text-gray-500 mt-1">Tháng {selectedMonth}/{selectedYear}</p>
              </div>
              <div className="p-6 h-80">
                {categoryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : categoryError ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-500">{categoryError}</p>
                  </div>
                ) : getStoreData(storeName).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStoreData(storeName)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStoreData(storeName).map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Chưa có dữ liệu danh mục</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : categoryLoading ? (
          <div className="col-span-2 flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="col-span-2 flex items-center justify-center h-80">
            <p className="text-gray-500">Chưa có dữ liệu cửa hàng</p>
          </div>
        )}
        
      </div>
      
    </div>
    
  );
}

export default OverviewPage;