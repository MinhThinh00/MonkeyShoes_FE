import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URI;

export const getPromotions = async (token, page = 0, size = 3) => {
  try {
    const response = await axios.get(`${baseURL}/discounts`, {
      params: {
        page,
        size
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// Tạo khuyến mãi mới
export const createPromotion = async (promotionData, token) => {
  try {
    const response = await axios.post(`${baseURL}/discounts`, promotionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (id, promotionData, token) => {
  try {
    const response = await axios.put(`${baseURL}/discounts/${id}`, promotionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

// Xóa khuyến mãi
export const deletePromotion = async (id, token) => {
  try {
    const response = await axios.delete(`${baseURL}/discounts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

export const getPromotionById = async (id, token) => {
  try {
    const response = await axios.get(`${baseURL}/discounts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }catch (error) {
    console.error('Error fetching promotion by ID:', error);
    throw error;
  }
}

// Thêm hàm lọc khuyến mãi
export const filterPromotions = async (filters, token) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.startDate) queryParams.append('startDate', `${filters.startDate}T00:00:00`);
    if (filters.endDate) queryParams.append('endDate', `${filters.endDate}T23:59:59`);
    if (filters.isActive !== '') queryParams.append('isActive', filters.isActive);
    if (filters.page !== undefined) queryParams.append('page', filters.page);
    if (filters.size !== undefined) queryParams.append('size', filters.size);
    
    const response = await fetch(`${baseURL}/discounts/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error filtering promotions:', error);
    throw error;
  }
};