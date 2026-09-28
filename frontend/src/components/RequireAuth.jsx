import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function RequireAuth({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (role && user.role !== role) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-head font-bold text-2xl text-navy">This page is for {role.toLowerCase()} accounts</h1>
        <p className="text-ink/60 mt-2">You are logged in as a {user.role.toLowerCase()}.</p>
        <Button as="link" to={user.role === 'WORKER' ? '/dashboard/worker' : '/dashboard/customer'} className="mt-6">Go to my dashboard</Button>
      </div>
    );
  }
  return children;
}
