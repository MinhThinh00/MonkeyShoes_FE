import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { userGetCart } from '../helper/cartHelper';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  // Add state for selected items
  const [selectedItems, setSelectedItems] = useState([]);
  // Add state for selected items total
  const [selectedTotal, setSelectedTotal] = useState(0);
  const navigate = useNavigate();
  
  // Get current user from Redux store
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để xem giỏ hàng');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    fetchCartItems(true); // Pass true for initial load
  }, [currentUser, navigate]);

  // Add useEffect to calculate selected total when selectedItems changes
  useEffect(() => {
    const total = selectedItems.reduce((sum, itemId) => {
      const item = cartItems.find(item => item.id === itemId);
      return sum + (item ? item.totalPrice : 0);
    }, 0);
    setSelectedTotal(total);
  }, [selectedItems, cartItems]);

  const fetchCartItems = async (isInitialLoad = false) => {
    // Only show loading indicator on initial load, not during updates
    if (isInitialLoad) {
      setLoading(true);
    }
    
    try {
      const cartData = await userGetCart(currentUser.userId, currentUser.token);
      
      if (cartData) {
        // If we already have items, preserve their order when updating
        if (cartItems.length > 0 && cartData.items && cartData.items.length > 0) {
          // Create a map of the new items by ID for quick lookup
          const newItemsMap = cartData.items.reduce((map, item) => {
            map[item.id] = item;
            return map;
          }, {});
          
          // First, update existing items while preserving their order
          const updatedItems = cartItems.map(existingItem => {
            // If the item still exists in the new data, return the updated version
            if (newItemsMap[existingItem.id]) {
              const updatedItem = newItemsMap[existingItem.id];
              // Remove from map so we know it's been processed
              delete newItemsMap[existingItem.id];
              return updatedItem;
            }
            // If the item no longer exists, return null (we'll filter these out)
            return null;
          }).filter(item => item !== null);
          
          // Add any new items that weren't in the original list
          const newItems = Object.values(newItemsMap);
          
          setCartItems([...updatedItems, ...newItems]);
        } else {
          // If we don't have existing items, just use the new list
          setCartItems(cartData.items || []);
        }
        
        setTotalPrice(cartData.totalAmount || 0);
        setItemCount(cartData.itemCount || 0);
      } else {
        setCartItems([]);
        setTotalPrice(0);
        setItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (isInitialLoad) {
        toast.error('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      // Optimistically update the UI first for a smoother experience
      const updatedItems = cartItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, totalPrice: (item.unitPrice * newQuantity) } 
          : item
      );
      setCartItems(updatedItems);
      
      const response = await fetch(`${import.meta.env.VITE_API_URI}/cart/${currentUser.userId}/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: new URLSearchParams({
          quantity: newQuantity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Fetch updated cart data without showing loading state
        await fetchCartItems(false);
        
        // Dispatch event to notify other components about cart update
        window.dispatchEvent(new Event('cart-updated'));
        
        toast.success('Giỏ hàng đã được cập nhật');
      } else {
        throw new Error(data.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.');
      // Revert to original data on error
      fetchCartItems(false);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    setUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URI}/cart/${currentUser.userId}/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: new URLSearchParams({
          itemId: itemId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove item from selected items if it was selected
        setSelectedItems(prev => prev.filter(id => id !== itemId));
        
        // Fetch updated cart data
        await fetchCartItems();
        
        // Dispatch event to notify other components about cart update
        window.dispatchEvent(new Event('cart-updated'));
        
        toast.success('Sản phẩm đã được xóa khỏi giỏ hàng');
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setUpdating(false);
    }
  };

  // Add function to toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Add function to select/deselect all items
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      // If all are selected, deselect all
      setSelectedItems([]);
    } else {
      // Otherwise, select all
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    console.log('Selected items:', selectedItems);
    // Get the selected items data to pass to checkout
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    
    // Navigate to checkout with selected items
    navigate('/checkout', { 
      state: { 
        cartItems: itemsToCheckout,
        totalPrice: selectedTotal,
        itemCount: selectedItems.length
      } 
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Giỏ hàng của bạn</h1>
          {!loading && itemCount > 0 && (
            <p className="text-gray-600 mb-8">
              Bạn đang có {itemCount} sản phẩm trong giỏ hàng
            </p>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 mb-4 text-lg">Giỏ hàng của bạn đang trống</div>
              <Link 
                to="/" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-700">Sản phẩm</h2>
                    {cartItems.length > 0 && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                          Chọn tất cả
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center">
                        <div className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.productName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 ml-0 sm:ml-4 mt-4 sm:mt-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-800">{item.productName}</h3>
                              <p className="text-sm text-gray-500">
                                {item.variantName || `${item.color} - ${item.size}`}
                              </p>
                            </div>
                            <div className="text-lg font-semibold text-gray-800 mt-2 sm:mt-0">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.totalPrice)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={updating || item.quantity <= 1}
                                className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={updating}
                                className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeItem(item.id)}
                              disabled={updating}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Giỏ hàng của bạn</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-200 pb-4">
                      <span className="text-gray-600">Số lượng đã chọn</span>
                      <span className="font-medium">{selectedItems.length} / {itemCount}</span>
                    </div>

                    <div className="flex justify-between border-b border-gray-200 pb-4">
                      <span className="text-gray-600">Tổng Tiền đã chọn</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedTotal)}
                      </span>
                    </div>
                 
                    
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Tổng cộng</span>
                      <span className="text-xl font-bold text-red-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedTotal)}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={updating || selectedItems.length === 0}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaCreditCard className="mr-2" />
                      Thanh toán đã chọn ({selectedItems.length})
                    </button>
                    
                    <Link 
                      to="/" 
                      className="block text-center text-blue-600 hover:text-blue-800 font-medium mt-4"
                    >
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;