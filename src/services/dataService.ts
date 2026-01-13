import api from './api';

// Users
export const getUsers = async () => {
    const response = await api.get('users/');
    return response.data;
};

export const createUser = async (userData: any) => {
    const response = await api.post('users/', userData);
    return response.data;
};

export const updateUser = async (id: string | number, userData: any) => {
    const response = await api.patch(`users/${id}/`, userData);
    return response.data;
};

export const deleteUser = async (id: string | number) => {
    const response = await api.delete(`users/${id}/`);
    return response.data;
};

// Tables
export const getTables = async () => {
    const response = await api.get('tables/');
    return response.data;
};

export const createTable = async (tableData: any) => {
    const response = await api.post('tables/', tableData);
    return response.data;
};

export const updateTable = async (id: string | number, tableData: any) => {
    const response = await api.patch(`tables/${id}/`, tableData);
    return response.data;
};

export const deleteTable = async (id: string | number) => {
    const response = await api.delete(`tables/${id}/`);
    return response.data;
};

// Categories
export const getCategories = async () => {
    const response = await api.get('categories/');
    return response.data;
};

export const createCategory = async (categoryData: any) => {
    const response = await api.post('categories/', categoryData);
    return response.data;
};

export const updateCategory = async (id: string | number, categoryData: any) => {
    const response = await api.patch(`categories/${id}/`, categoryData);
    return response.data;
};

export const deleteCategory = async (id: string | number) => {
    const response = await api.delete(`categories/${id}/`);
    return response.data;
};

// Menu Items
export const getMenuItems = async () => {
    const response = await api.get('menu-items/');
    return response.data;
};

export const createMenuItem = async (itemData: any) => {
    const response = await api.post('menu-items/', itemData);
    return response.data;
};

export const updateMenuItem = async (id: string | number, itemData: any) => {
    const response = await api.patch(`menu-items/${id}/`, itemData);
    return response.data;
};

export const deleteMenuItem = async (id: string | number) => {
    const response = await api.delete(`menu-items/${id}/`);
    return response.data;
};

// Orders
export const getOrders = async () => {
    const response = await api.get('orders/');
    return response.data;
};

export const createOrder = async (orderData: any) => {
    const response = await api.post('orders/', orderData);
    return response.data;
};

export const updateOrder = async (id: string | number, orderData: any) => {
    const response = await api.patch(`orders/${id}/`, orderData);
    return response.data;
};

export const deleteOrder = async (id: string | number) => {
    const response = await api.delete(`orders/${id}/`);
    return response.data;
};

// Transactions
export const getTransactions = async () => {
    const response = await api.get('transactions/');
    return response.data;
};

export const createTransaction = async (transactionData: any) => {
    const response = await api.post('transactions/', transactionData);
    return response.data;
};
