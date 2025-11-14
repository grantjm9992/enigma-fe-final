import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Users',
      description: 'Manage gym users, trainers, and admins',
      link: '/users',
      icon: '👥',
      color: 'from-blue-600 to-blue-700',
      stats: 'Manage Roles'
    },
    {
      title: 'Exercises',
      description: 'Create and manage exercises',
      link: '/exercises',
      icon: '💪',
      color: 'from-green-600 to-green-700',
      stats: 'Build Library'
    },
    {
      title: 'Categories',
      description: 'Organize exercises by category',
      link: '/categories',
      icon: '📁',
      color: 'from-yellow-600 to-yellow-700',
      stats: 'Organize'
    },
    {
      title: 'Tags',
      description: 'Tag exercises for better organization',
      link: '/tags',
      icon: '🏷️',
      color: 'from-pink-600 to-pink-700',
      stats: 'Label & Find'
    },
    {
      title: 'Routines',
      description: 'Build workout routines from exercises',
      link: '/routines',
      icon: '📋',
      color: 'from-purple-600 to-purple-700',
      stats: 'Create Plans'
    },
    {
      title: 'Sessions',
      description: 'Schedule and manage training sessions',
      link: '/sessions',
      icon: '📅',
      color: 'from-red-600 to-red-700',
      stats: 'Schedule'
    },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              Manage your boxing gym from this professional dashboard
            </p>
          </div>
          <div className="hidden md:block text-8xl opacity-20">
            🥊
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {menuItems.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className="group relative overflow-hidden bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`text-5xl p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                  {item.icon}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${item.color} text-white`}>
                    {item.stats}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {item.title}
              </h2>
              <p className="text-slate-400">
                {item.description}
              </p>

              {/* Arrow Icon */}
              <div className="mt-4 flex items-center text-indigo-400 font-semibold">
                <span className="group-hover:translate-x-2 transition-transform duration-300">
                  Manage →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Start Guide</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="text-2xl mb-2">1️⃣</div>
            <h4 className="font-semibold text-white mb-1">Set Up Users</h4>
            <p className="text-sm text-slate-400">Add trainers and gym members to the system</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="text-2xl mb-2">2️⃣</div>
            <h4 className="font-semibold text-white mb-1">Create Exercises</h4>
            <p className="text-sm text-slate-400">Build your exercise library with categories and tags</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="text-2xl mb-2">3️⃣</div>
            <h4 className="font-semibold text-white mb-1">Schedule Sessions</h4>
            <p className="text-sm text-slate-400">Create routines and schedule training sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
