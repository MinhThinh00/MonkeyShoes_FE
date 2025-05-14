// import { createAsyncThunk } from '@reduxjs/toolkit';
// import {
//   loginStart,
//   loginSuccess,
//   loginFailure,
//   logout,
//   updateUserStart,
//   updateUserSuccess,
//   updateUserFailure,
// } from '../slices/userSlice';
// import jwtDecode from 'jwt-decode';

// // Login action with token handling
// export const loginUser = (credentials) => async (dispatch) => {
//   try {
//     dispatch(loginStart());
    
//     // Make the actual API call to login
//     const response = await fetch('http://localhost:8080/auth/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(credentials),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.message || 'Login failed');
//     }
    
//     // Decode the JWT token
//     const decodedToken = jwtDecode(data.token);
    
//     // Create user object from decoded token
//     const user = {
//       userId: decodedToken.userId,
//       email: decodedToken.sub,
//       role: decodedToken.role,
//       token: data.token,
//       username: data.username || decodedToken.sub.split('@')[0],
//     };
    
//     // Save to localStorage
//     localStorage.setItem('user', JSON.stringify(user));
    
//     // Update Redux store
//     dispatch(loginSuccess(user));
//     return user;
//   } catch (error) {
//     dispatch(loginFailure(error.message));
//     throw error;
//   }
// };

// export const logoutUser = () => (dispatch) => {
//   localStorage.removeItem('user');
//   dispatch(logout());
// };

// export const updateUser = (userId, userData) => async (dispatch) => {
//   try {
//     dispatch(updateUserStart());
    
//     const token = JSON.parse(localStorage.getItem('user'))?.token;
    
//     if (!token) {
//       throw new Error('Authentication required');
//     }
    
//     const response = await fetch(`http://localhost:8080/users/${userId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(userData),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.message || 'Update failed');
//     }
    
//     dispatch(updateUserSuccess(data));
//     return data;
//   } catch (error) {
//     dispatch(updateUserFailure(error.message));
//     throw error;
//   }
// };

// // Verify OTP action
// export const verifyOTP = (verificationData) => async (dispatch) => {
//   try {
//     dispatch(loginStart());
    
//     const response = await fetch('http://localhost:8080/auth/verify', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: verificationData.email,
//         otp: parseInt(verificationData.otp, 10)
//       }),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.message || 'OTP verification failed');
//     }
    
//     // If token is returned, decode and login
//     if (data.token) {
//       const decodedToken = jwtDecode(data.token);
      
//       const user = {
//         userId: decodedToken.userId,
//         email: decodedToken.sub,
//         role: decodedToken.role,
//         token: data.token,
//         username: data.username || decodedToken.sub.split('@')[0],
//       };
      
//       localStorage.setItem('user', JSON.stringify(user));
//       dispatch(loginSuccess(user));
//       return { user, verified: true };
//     }
    
//     return { verified: true };
//   } catch (error) {
//     dispatch(loginFailure(error.message));
//     throw error;
//   }
// };

// // Register user action
// export const registerUser = (userData) => async (dispatch) => {
//   try {
//     const response = await fetch('http://localhost:8080/auth/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(userData),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.message || 'Registration failed');
//     }
    
//     return { email: userData.email, registered: true };
//   } catch (error) {
//     throw error;
//   }
// };