import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URI;


export const getOrderByStoreId = async (storeId, token, page = 0) => {
  try {
    const response = await axios.get(`${baseURL}/orders/store/${storeId}?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching orders by store ID:', error);
    throw error;
  }
};

export const getOrderById = async (orderId, token) => {
  try {
    const response = await axios.get(`${baseURL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

// Add new function to update order status
// Update function to match API that uses request parameter
export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const response = await axios.put(`${baseURL}/orders/${orderId}/status?status=${status}`, 
      {},  // Empty body since we're using query parameter
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrderByFilter = async (storeId, token, page = 0, startDate = '', endDate = '', status = '') => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    
    if (startDate) {
      // Add start time as 00:00:00
      const formattedStartDate = `${startDate}T00:00:00`;
      params.append('startDate', formattedStartDate);
    }
    
    if (endDate) {
      // Add end time as 23:59:59
      const formattedEndDate = `${endDate}T23:59:59`;
      params.append('endDate', formattedEndDate);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await axios.get(`${baseURL}/orders/store/${storeId}/filter?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching filtered orders:', error);
    throw error;
  }
};