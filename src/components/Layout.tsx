import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Outlet />;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="text-white text-3xl">🥊</div>
              <div>
                <h1 className="text-xl font-bold text-white">Boxing Gym Manager</h1>
                <p className="text-xs text-indigo-200">Professional Management System</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/users"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/users')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Users
              </Link>
              <Link
                to="/exercises"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/exercises')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Exercises
              </Link>
              <Link
                to="/categories"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/categories')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/tags"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/tags')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Tags
              </Link>
              <Link
                to="/routines"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/routines')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Routines
              </Link>
              <Link
                to="/sessions"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/sessions')
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-indigo-700'
                }`}
              >
                Sessions
              </Link>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">
                  {user.name} {user.surname}
                </p>
                <p className="text-xs text-indigo-200 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
