import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './redux/slices/userSlice'; // Changed from setUser to loginSuccess
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import OTPVerification from './components/Auth/OTPVerification';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import AddProduct from './components/Products/AddProduct';
import OAuth2RedirectHandler from './components/Auth/OAuth2RedirectHandler';
import HomePage from './pages/HomePage';
import Customers from './pages/Customers';
import Accounts from './pages/Accounts';
import Promotions from './pages/Promotions';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Products from './pages/Products';
import PaymentCallback from './pages/PaymentCallback';
import EditProduct from './components/Products/EditProduct';

// Add this import at the top with your other imports
import Cart from './pages/Cart';
import ProfileLayout from './layouts/ProfileLayout';
import Infor from './pages/ProfileUser/Infor';
import OrderHistory from './pages/ProfileUser/OrderHistory';


function App() {
  const dispatch = useDispatch();
  
  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      dispatch(loginSuccess(JSON.parse(storedUser))); // Changed from setUser to loginSuccess
    }
  }, [dispatch]);
  
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path="/oauth2/success" element={<OAuth2RedirectHandler />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products/*" element={<Products />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        {/* Route cha sử dụng DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} /> 
          <Route path="accounts" element={<Accounts />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="discounts" element={<Promotions />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
        </Route>
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path='/checkout' element={<Checkout />} />\
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<OrderHistory />} />
          <Route path="information" element={<Infor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
