import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSpinner, FaGoogle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/userSlice'; // Changed action imports
import { decodeToken } from '../../utils/tokenUtils';

const Login = () => {

  const authURL = import.meta.env.VITE_API_AUTH;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError('');
    dispatch(loginStart()); // Changed from setLoading to loginStart

    try {
      const response = await fetch(`${authURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      const decodedToken = decodeToken(data.token);
     // console.log(decodedToken.userName);
      const user = {
        email: formData.email,
        name: decodedToken.userName,
        token: data.token,
        role: decodedToken.role,
        userId: decodedToken.userId
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch(loginSuccess(user)); // Changed from setUser to loginSuccess
      
      // Show success message
      toast.success('Đăng nhập thành công!');
      
      // Redirect based on role
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        navigate('/dashboard');
      } else {
        // Redirect to previous page or home
        navigate(from);
      }
    } catch (err) {
      const errorMessage = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setLocalError(errorMessage);
      dispatch(loginFailure(errorMessage)); // Changed from setReduxError to loginFailure
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
      // No need to dispatch setLoading(false) as it's handled in the reducers
    }
  };

  // Google Login handler
  const handleGoogleLogin = () => {
    window.location.href = `${authURL}/oauth2/authorization/google`;
  };

  // Structure copied from Signup.jsx, adapted for Login
  return (
    // Use the background and centering from Signup.jsx
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
         {/* Optional: Add logo here if desired */}
         {/* <img className="mx-auto h-16 w-auto mb-6" src={logo} alt="Monkey Shoes Logo" /> */}
        <h2 className="text-center text-4xl font-extrabold text-gray-900">
          Đăng nhập tài khoản {/* Changed title */}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Use card styling from Signup.jsx */}
        <div className="bg-white py-10 px-6 shadow-lg sm:rounded-lg sm:px-12 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded">
              <p className="text-base">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Removed Name field */}

            {/* Email field (styling from Signup) */}
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  placeholder="your-email@example.com"
                />
              </div>
            </div>

            {/* Password field (styling from Signup) */}
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password" // Use current-password for login
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <FaEye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* Removed password hint */}
            </div>

            {/* Removed Confirm Password field */}

            {/* Optional: Add Remember Me / Forgot Password (styling adapted) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" // Adjusted size
                />
                <label htmlFor="remember-me" className="ml-2 block text-base text-gray-900"> {/* Adjusted size */}
                  Ghi nhớ tôi
                </label>
              </div>
              <div className="text-base"> {/* Adjusted size */}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Removed Terms checkbox */}

            {/* Submit Button (styling from Signup) */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Đang xử lý...
                  </span>
                ) : 'Đăng nhập'} {/* Changed button text */}
              </button>
            </div>
          </form>

          {/* Separator and Google Button (styling from Signup) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 text-base">Hoặc đăng nhập với</span> {/* Changed text */}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                // Adjusted classes for better text/icon color and hover effect
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <FaGoogle className="h-5 w-5 mr-2 text-[#4285F4]" />
                <span className="text-gray-800 group-hover:text-gray-900">
                  Tiếp Tục với Google
                </span>
              </button>
            </div>
          </div>

          {/* Link to Signup page */}
          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;