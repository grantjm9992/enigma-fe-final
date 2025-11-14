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
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="text-white text-3xl">🥊</div>
              <div>
                <h1 className="text-xl font-bold text-white">Boxing Gym Manager</h1>
                <p className="text-xs text-slate-400">Professional Management System</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/users"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/users')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Users
              </Link>
              <Link
                to="/exercises"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/exercises')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Exercises
              </Link>
              <Link
                to="/categories"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/categories')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/tags"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/tags')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Tags
              </Link>
              <Link
                to="/routines"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/routines')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Routines
              </Link>
              <Link
                to="/sessions"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/sessions')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
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
