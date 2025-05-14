// getOrderByUserId.js
import axios from 'axios';

export const getOrderByUserId = async (userId, token) => {
  try {
    if (!userId) {
      throw new Error('User ID không hợp lệ');
    }

    if (!token) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    const baseURL = import.meta.env.VITE_API_URI;
    const response = await axios.get(`${baseURL}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error);
    throw error;
  }
};

