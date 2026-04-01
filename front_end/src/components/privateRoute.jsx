import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

/**
 * Wraps any route that requires authentication.
 * Also supports role-based access: <PrivateRoute roles={['admin']} />
 */
export default function PrivateRoute({ children, roles }) {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  if (!token) {
    // Not logged in — redirect to login, preserve intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    // Logged in but wrong role — redirect to their own dashboard
    const dashboardMap = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
    return <Navigate to={dashboardMap[role] || '/login'} replace />;
  }

  return children;
}