import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/categories');
export const getOrders = () => api.get('/orders/myorders');
export const createOrder = (orderData) => api.post('/orders', orderData);
export const submitPaymentProof = (id, image) => api.put(`/orders/${id}/proof`, { image });
export const verifyPayment = (id, status, note) => api.put(`/orders/${id}/verify`, { status, note });
export const uploadImage = (formData) => api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getNotifications = () => api.get('/notifications');
export const validateCoupon = (data) => api.post('/coupons/validate', data);

export default api;
