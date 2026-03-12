import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getAdminMetrics = () => adminApi.get('/admin/metrics');
export const getAdminProducts = () => adminApi.get('/products');
export const createAdminProduct = (product) => adminApi.post('/products', product);
export const updateAdminProduct = (id, product) => adminApi.put(`/products/${id}`, product);
export const deleteAdminProduct = (id) => adminApi.delete(`/products/${id}`);

export const getAdminCategories = () => adminApi.get('/categories');
export const createAdminCategory = (category) => adminApi.post('/categories', category);
export const updateAdminCategory = (id, category) => adminApi.put(`/categories/${id}`, category);
export const deleteAdminCategory = (id) => adminApi.delete(`/categories/${id}`);
export const getAdminOrders = () => adminApi.get('/orders');
export const updateAdminOrderStatus = (id, status) => adminApi.put(`/orders/${id}/status`, { status });
export const verifyAdminPayment = (id, status, note) => adminApi.put(`/orders/${id}/verify`, { status, note });
export const getAdminDeliveries = () => adminApi.get('/deliveries');
export const assignRiderToOrder = (orderId, riderId) => adminApi.put(`/orders/${orderId}/assign`, { riderId });
export const getAdminCustomers = () => adminApi.get('/users');
export const deleteAdminCustomer = (id) => adminApi.delete(`/users/${id}`);
export const getAdminCoupons = () => adminApi.get('/coupons');
export const createAdminCoupon = (coupon) => adminApi.post('/coupons', coupon);
export const deleteAdminCoupon = (id) => adminApi.delete(`/coupons/${id}`);

export default adminApi;
