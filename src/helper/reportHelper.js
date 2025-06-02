import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URI || 'http://localhost:8080/api';


export const getYearlyRevenueReport = async (year,token) => {
  try {
    const response = await axios.get(`${API_BASE}/report/revenue/${year}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch yearly revenue report:', error);
    throw error;
  }
};

export const getMonthlyCategoryRevenueReport = async (month, year,token) => {
  try {
    const response = await axios.get(`${API_BASE}/report/revenue/category/${month}/${year}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch monthly category revenue report:', error);
    throw error;
  }
};

// Helper function to format currency values
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

// Helper function to format compact currency values (for charts)
export const formatCompactCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value);
};

export const getTopProductsByStore = async (month, year, token) => {
    try {
      const response = await axios.get(`${API_BASE}/report/top-products/${month}/${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top products by store:', error);
      throw error;
    }
  };

  export const getSummaryReport = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/report/stores/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch top products by store:', error);
      throw error;
    }
  }
  