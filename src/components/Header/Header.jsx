import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import logo from '../../assets/logo.png';
import { userGetCart } from '../../helper/cartHelper';

const Header = ({ onSearch }) => {
  const baseURL = import.meta.env.VITE_API_URI;

  const [userLogin, setUserLogin] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const currentUser = useSelector(state => state.user.currentUser);
  
  const fetchUser = async () => {
    try {
      const response = await fetch(`${baseURL}/users/${currentUser.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      const data = await response.json();
      
      // Sửa thành:
      if (data && data.data) {
        setUserLogin(data.data); // Giả sử API trả về data.data chứa thông tin user
        console.log('User data:', data.data);
      }
      
    } catch (error) {
      throw error;
    }
  };
  // Lấy tham số tìm kiếm từ URL khi component được tải
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search') || '';
    setSearchTerm(searchFromUrl);
  }, [location.search]);
  useEffect(() => {
    if (currentUser) {
      fetchUser();
    }
  }, [currentUser]);
  // Fetch cart data when component mounts or user changes
  useEffect(() => {
    const fetchCartData = async () => {
      if (currentUser && currentUser.userId && currentUser.token) {
        const cartData = await userGetCart(currentUser.userId, currentUser.token);
        if (cartData) {
          setCartItemCount(cartData.itemCount);
        }
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartData();
    
    // Set up event listener for cart updates
    window.addEventListener('cart-updated', fetchCartData);
    
    return () => {
      window.removeEventListener('cart-updated', fetchCartData);
    };
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    
    dispatch(logout());
    
    setShowDropdown(false);
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Chuyển hướng đến trang sản phẩm với tham số tìm kiếm
    const searchParams = new URLSearchParams();
    searchParams.set('search', searchTerm || '');
    navigate(`/products?${searchParams.toString()}`);
    
    // Gọi callback onSearch nếu được cung cấp
    if (onSearch && typeof onSearch === 'function') {
      onSearch(searchTerm);
    }
  };

  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-24 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="relative group rounded-full p-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 transform hover:scale-105">
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto object-contain transition-all duration-300 group-hover:opacity-90 group-hover:filter group-hover:drop-shadow-lg animate-logo-load"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                }}
              />
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-12">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-6 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 text-base transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <FaSearch className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link to="/cart" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors group">
              <div className="relative">
                <FaShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {/* <span className="ml-2 font-medium">Giỏ hàng</span> */}
            </Link>
            
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {userLogin && userLogin.img ? (
                      <img src={userLogin.img} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle className="h-7 w-7 text-blue-500" />
                    )}
                  </div>
               
                  <span className="ml-2 font-medium">
                    {(userLogin && userLogin.name) || currentUser?.name || 'Khách'}
                  </span>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                   
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Tài khoản của tôi
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors group">
                <FaUser className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="ml-2 font-medium">Tài khoản</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Categories Menu */}
        <nav className="py-4 border-t border-gray-100">
          <ul className="flex justify-center space-x-12 text-base font-medium">
            <li>
              <Link
                to="/products/men"
                className={`text-gray-700 hover:text-blue-600 transition-colors relative group py-2 block ${
                  isActive('/products/men') ? 'text-blue-600' : ''
                }`}
              >
                Nam
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform ${
                  isActive('/products/men') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                } transition-transform`}></span>
              </Link>
            </li>
            <li>
              <Link
                to="/products/women"
                className={`text-gray-700 hover:text-blue-600 transition-colors relative group py-2 block ${
                  isActive('/products/women') ? 'text-blue-600' : ''
                }`}
              >
                Nữ
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform ${
                  isActive('/products/women') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                } transition-transform`}></span>
              </Link>
            </li>
            <li>
              <Link
                to="/products/kids"
                className={`text-gray-700 hover:text-blue-600 transition-colors relative group py-2 block ${
                  isActive('/products/kids') ? 'text-blue-600' : ''
                }`}
              >
                Trẻ em
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform ${
                  isActive('/products/kids') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                } transition-transform`}></span>
              </Link>
            </li>
            <li>
              <Link
                to="/products/sale"
                className={`text-red-600 hover:text-red-700 transition-colors relative group py-2 block font-semibold ${
                  isActive('/products/sale') ? 'text-red-700' : ''
                }`}
              >
                Khuyến mãi
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform ${
                  isActive('/products/sale') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                } transition-transform`}></span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Inline CSS for Logo Animation */}
      <style jsx>{`
        @keyframes logoLoad {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-logo-load {
          animation: logoLoad 0.6s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;