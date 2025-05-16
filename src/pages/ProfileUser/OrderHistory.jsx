import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getOrderByUserId } from '../../helper/getOrderByUserId';
import OrderCart from '../../components/OrderCart';
import { FaSpinner, FaExclamationTriangle, FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OrderHistory = () => {
    const currentUser = useSelector((state) => state.user.currentUser);
    console.log('Current user:', currentUser);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Pass both userId and token to the getOrderByUserId function
                const response = await getOrderByUserId(currentUser.userId, currentUser.token);
                console.log('Orders data:', response);
                
                // Update state with the correct response structure
                if (response.success && response.data) {
                    setOrders(response.data.orders || []);
                    setPagination({
                        currentPage: response.data.currentPage,
                        totalItems: response.data.totalItems,
                        totalPages: response.data.totalPages
                    });
                } else {
                    setOrders([]);
                    toast.error(response.message || 'Không có dữ liệu đơn hàng');
                }
                
                setError(null);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
                toast.error('Không thể tải lịch sử đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch orders if we have a user with ID and token
        if (currentUser && currentUser.userId && currentUser.token) {
            fetchOrders();
        } else {
            setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
            setLoading(false);
        }
    }, [currentUser]);

    const handleOrderStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(order => 
            order.id === orderId ? {...order, status: newStatus} : order
        ));
    };

    return (
        <div className="order-history-container" style={{ padding: '20px' }}>
            <h2 className="order-history-title" style={{ fontSize: '24px', marginBottom: '20px' }}>
                Lịch sử đơn hàng {pagination.totalItems > 0 ? `(${pagination.totalItems})` : ''}
            </h2>
            
            {loading ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <FaSpinner className="spinner" style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải đơn hàng...</p>
                    <style jsx>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .spinner {
                            animation: spin 1s linear infinite;
                        }
                    `}</style>
                </div>
            ) : error ? (
                <div className="error-container" style={{ 
                    padding: '16px', 
                    backgroundColor: '#ffebee', 
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <FaExclamationTriangle style={{ color: '#f44336', fontSize: '24px' }} />
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#d32f2f' }}>Lỗi</h4>
                        <p style={{ margin: 0 }}>{error}</p>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-container" style={{ 
                    textAlign: 'center', 
                    padding: '40px 0',
                    color: '#757575'
                }}>
                    <FaShoppingBag style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '16px' }}>Bạn chưa có đơn hàng nào</p>
                </div>
            ) : (
                <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map(order => (
                        <OrderCart 
                            key={order.id} 
                            order={order} 
                            onOrderStatusChange={handleOrderStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;