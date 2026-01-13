import api from './api';

export const login = async (username: string, pin: string) => {
    const response = await api.post('auth/login/', { username, password: pin });
    if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify({
            username: response.data.username,
            role: response.data.role,
            id: response.data.id
        }));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentWaiter');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};
