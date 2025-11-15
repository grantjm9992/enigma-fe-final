import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionsApi } from '../services/api';
import type { Session } from '../types/api';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdminOrTrainer = user?.role === 'admin' || user?.role === 'trainer';

  // State for user calendar view
  const [sessions, setSessions] = useState<Session[]>([]);
  const [viewingSession, setViewingSession] = useState<Session | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminOrTrainer) {
      loadSessions();
    }
  }, [isAdminOrTrainer]);

  const loadSessions = async () => {
    try {
      const response = await sessionsApi.getAll();
      setSessions(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    }
  };

  const handleSignup = async (sessionId: string) => {
    try {
      await sessionsApi.signup(sessionId);
      loadSessions();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up for session');
    }
  };

  const handleRemove = async (sessionId: string) => {
    if (!confirm('Are you sure you want to leave this session?')) return;
    try {
      await sessionsApi.remove(sessionId);
      loadSessions();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave session');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === day.getFullYear() &&
        sessionDate.getMonth() === day.getMonth() &&
        sessionDate.getDate() === day.getDate()
      );
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const closeViewSession = () => {
    setViewingSession(null);
  };

  // Admin/Trainer Dashboard
  if (isAdminOrTrainer) {
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

  // Regular User Dashboard - Calendar View
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
              View and manage your training sessions
            </p>
          </div>
          <div className="hidden md:block text-8xl opacity-20">
            🥊
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={previousMonth}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Month View */}
        <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-lg overflow-hidden">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-slate-700 p-3 text-center text-sm font-semibold text-slate-300"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {getDaysInMonth(currentMonth).map((day, index) => {
            const isToday =
              day &&
              day.toDateString() === new Date().toDateString();
            const daySessions = day ? getSessionsForDay(day) : [];

            return (
              <div
                key={index}
                className={`bg-slate-800 min-h-[120px] p-2 ${
                  day ? 'hover:bg-slate-750 cursor-pointer' : ''
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday
                          ? 'bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-full'
                          : 'text-slate-300'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {daySessions.map((session) => (
                        <button
                          key={session._id}
                          onClick={() => setViewingSession(session)}
                          className="w-full text-left px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors truncate"
                          title={session.name}
                        >
                          {new Date(session.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          {session.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* View Session Modal */}
      {viewingSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{viewingSession.name}</h2>
              <button
                onClick={closeViewSession}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {viewingSession.description && (
              <p className="text-slate-300 mb-6">{viewingSession.description}</p>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-slate-300">
                <span className="text-lg mr-3">📅</span>
                <span className="font-medium mr-2">Date:</span>
                <span className="text-slate-400">{formatDate(viewingSession.date)}</span>
              </div>

              {viewingSession.duration && (
                <div className="flex items-center text-slate-300">
                  <span className="text-lg mr-3">⏱️</span>
                  <span className="font-medium mr-2">Duration:</span>
                  <span className="text-slate-400">{Math.round(viewingSession.duration / 60)} minutes</span>
                </div>
              )}

              {viewingSession.location && (
                <div className="flex items-center text-slate-300">
                  <span className="text-lg mr-3">📍</span>
                  <span className="font-medium mr-2">Location:</span>
                  <span className="text-slate-400">{viewingSession.location}</span>
                </div>
              )}

              {viewingSession.maxParticipants && (
                <div className="flex items-center text-slate-300">
                  <span className="text-lg mr-3">👥</span>
                  <span className="font-medium mr-2">Participants:</span>
                  <span className="text-slate-400">
                    {viewingSession.attendeeIds?.length || 0} / {viewingSession.maxParticipants}
                  </span>
                </div>
              )}
            </div>

            {viewingSession.routines && viewingSession.routines.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Routines</h3>
                <ul className="space-y-2">
                  {viewingSession.routines.map((routine, index) => (
                    <li
                      key={index}
                      className="flex items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <span className="text-indigo-400 font-semibold mr-3">#{index + 1}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{routine.name}</h4>
                        {routine.description && (
                          <p className="text-sm text-slate-400 mt-1">{routine.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-slate-700">
              {viewingSession.attendeeIds?.includes(user?._id || '') ? (
                <button
                  onClick={() => {
                    handleRemove(viewingSession._id);
                    closeViewSession();
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                >
                  Leave Session
                </button>
              ) : viewingSession.maxParticipants && viewingSession.attendeeIds && viewingSession.attendeeIds.length >= viewingSession.maxParticipants ? (
                <div className="text-center py-3 text-slate-400">
                  <p className="font-medium">Session is Full</p>
                  <p className="text-sm">This session has reached maximum capacity</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleSignup(viewingSession._id);
                    closeViewSession();
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Sign Up for Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
