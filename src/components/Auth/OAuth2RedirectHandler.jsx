import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { decodeToken } from '../../utils/tokenUtils';
import { loginSuccess, loginFailure } from '../../redux/slices/userSlice';
import { toast } from 'react-hot-toast';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Prevent duplicate processing
      if (processedRef.current) return;
      processedRef.current = true;
      
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const expiresIn = params.get('expiresIn');

        if (!token) {
          throw new Error('Không nhận được token từ Google');
        }

        const decoded = decodeToken(token);
        if (!decoded?.sub || !decoded?.userName) {
          throw new Error('Token không hợp lệ hoặc thiếu thông tin');
        }

        const user = {
          email: decoded.sub,
          name: decoded.userName,
          token,
          role: decoded.role,
          userId: decoded.userId,
        };

        // Save user data first
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(loginSuccess(user));
        
        // Show success toast and navigate after a small delay to ensure state updates
        toast.success('Đăng nhập Google thành công!');
        
        // Use setTimeout to ensure navigation happens after state updates
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } catch (err) {
        console.error('OAuth error:', err.message);
        dispatch(loginFailure(err.message));
        toast.error(err.message || 'Lỗi đăng nhập bằng Google.');
        
        // Use setTimeout for error navigation as well
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 100);
      }
    };

    handleOAuthRedirect();
  }, [navigate, dispatch]);

  return null;
};

export default OAuth2RedirectHandler;