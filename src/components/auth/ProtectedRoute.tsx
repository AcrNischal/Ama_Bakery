import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '@/services/authService';

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'supervisor' | 'waiter' | 'kitchen')[];
    redirectPath?: string;
}

const ProtectedRoute = ({
    allowedRoles,
    redirectPath = '/waiter'
}: ProtectedRouteProps) => {
    const isAuth = isAuthenticated();
    const user = getCurrentUser();

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
