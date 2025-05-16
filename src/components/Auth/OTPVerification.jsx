import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }

    // Countdown timer for OTP resend
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [countdown, canResend, email, navigate]);

  const handleChange = (e) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8169/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: parseInt(otp, 10)
        }),
      });
      //console.log(response);
      //const data = await response.data();

      if (!response.ok) {
        throw new Error(data.message || 'Xác thực OTP thất bại');
      }

      toast.success('Xác thực thành công! Vui lòng đăng nhập.');
      // Navigate to login after successful verification
      navigate('/login', { state: { verificationSuccess: true } });
    } catch (err) {
      setError(err.message || 'Xác thực OTP thất bại. Vui lòng thử lại.');
      toast.error(err.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8169/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gửi lại OTP thất bại');
      }

      toast.success('Đã gửi lại mã OTP!');
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.');
      toast.error(err.message || 'Gửi lại OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Xác thực tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Chúng tôi đã gửi mã OTP đến email {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Mã OTP
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Nhập mã 6 chữ số"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Đang xử lý...
                  </span>
                ) : 'Xác thực'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Không nhận được mã?{' '}
              <button
                onClick={handleResendOTP}
                disabled={!canResend || loading}
                className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canResend ? 'Gửi lại mã' : `Gửi lại sau ${countdown}s`}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;