import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URI;

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${baseURL}/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${baseURL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchStores = async (token) => {
  try {
    const response = await axios.get(`${baseURL}/store`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

export const createProductApi = async (productData, token) => {
    try {
        const response = await axios.post(
            `${baseURL}/products`,
            productData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const fetchProductsByStore = async (storeId, page = 0) => {
  return axios.get(`${baseURL}/products/store/${storeId}?page=${page}`);
};

export const updateProductApi = async (productId, productData, token) => {
  try {
    const response = await axios.put(
      `${baseURL}/products/${productId}`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};