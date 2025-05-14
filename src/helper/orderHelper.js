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

