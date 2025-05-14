/**
 * Fetches the user's cart data from the API
 * @param {string} userId - The user's ID
 * @param {string} token - The user's authentication token
 * @returns {Promise<Object>} - The cart data or null if error
 */
export const userGetCart = async (userId, token) => {
  if (!userId || !token) {
    return null;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URI}/cart/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        id: result.data.id,
        userId: result.data.userId,
        items: result.data.items || [],
        totalAmount: result.data.totalAmount || 0,
        itemCount: result.data.itemCount || 0,
        updatedAt: result.data.updatedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
};