import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const menuItems = [
    { title: 'Users', description: 'Manage gym users, trainers, and admins', link: '/users', icon: '👥' },
    { title: 'Exercises', description: 'Create and manage exercises', link: '/exercises', icon: '💪' },
    { title: 'Categories', description: 'Organize exercises by category', link: '/categories', icon: '📁' },
    { title: 'Tags', description: 'Tag exercises for better organization', link: '/tags', icon: '🏷️' },
    { title: 'Routines', description: 'Build workout routines from exercises', link: '/routines', icon: '📋' },
    { title: 'Sessions', description: 'Schedule and manage training sessions', link: '/sessions', icon: '📅' },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your boxing gym from this dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {item.title}
            </h2>
            <p className="text-gray-600">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
