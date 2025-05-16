import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URI;
console.log(API_BASE);
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/products`);
    console.log(response.data);
    return response.data; // Return response.data instead of the entire response
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/products/${id}`);
    return response.data; // Also update this to return response.data
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const getProductByType = async (type) => {
  try {
   const response = await axios.get(`${API_BASE}/products/group/${type}`); 
   return response.data;
  }
  catch(error){
    console.error(`Error fetching product with type ${type}:`, error);
    throw error;
  } 
}
export const getProductFilter = async (filter) => {
  
}