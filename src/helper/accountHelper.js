import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URI;

export const adminCreateAccount = (data,token ) => {
    try {
        const response = axios.post(`${baseURL}/users`, 
            data, 
            {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const updateAccount = async (accountId, accountData, token) => {
    try {
      const response = await axios.put(`${baseURL}/users/${accountId}`, accountData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  export const deleteAccount = async (accountId, token) => {
    try {
      const response = await axios.delete(`${baseURL}/users/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); 
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };


  export const getStaffAccounts = async (token, page = 0, search = '', role = '') => {
    try {
      const response = await axios.get(`${baseURL}/users/staff`, {
        params: {
          page: page,
          search: search,
          role: role === 'all' ? '' : role
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };