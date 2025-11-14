import { useState, useEffect } from 'react';
import type { User, CreateUserDto, UpdateUserDto, UserRole, Session } from '../types/api';
import { usersApi, sessionsApi } from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [viewMode, setViewMode] = useState<'manage' | 'students'>('manage');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentSessions, setStudentSessions] = useState<Session[]>([]);
  const [chartType, setChartType] = useState<'category' | 'tag'>('category');

  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentSessions(selectedStudent._id);
    }
  }, [selectedStudent]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll(filterRole || undefined);
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentSessions = async (userId: string) => {
    try {
      const response = await sessionsApi.getAll();
      const userSessions = response.data.filter(session =>
        session.participantIds?.includes(userId)
      );
      setStudentSessions(userSessions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: UpdateUserDto = { ...formData };
        if (!updateData.password) delete updateData.password;
        await usersApi.update(editingUser._id, updateData);
      } else {
        await usersApi.create(formData);
      }
      closeModal();
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getStudentStats = () => {
    if (!studentSessions.length) return null;

    const totalSessions = studentSessions.length;
    const exerciseFrequency: { [key: string]: number } = {};
    const categoryFrequency: { [key: string]: number } = {};
    const tagFrequency: { [key: string]: number } = {};

    studentSessions.forEach(session => {
      session.routines?.forEach(routine => {
        routine.exercises?.forEach(exercise => {
          // Count by exercise name
          exerciseFrequency[exercise.name] = (exerciseFrequency[exercise.name] || 0) + 1;

          // Count by category
          if (exercise.category) {
            categoryFrequency[exercise.category] = (categoryFrequency[exercise.category] || 0) + 1;
          }

          // Count by tags
          exercise.tags?.forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          });
        });
      });
    });

    return {
      totalSessions,
      exerciseFrequency,
      categoryFrequency,
      tagFrequency,
    };
  };

  const getChartData = () => {
    const stats = getStudentStats();
    if (!stats) return [];

    const frequency = chartType === 'category' ? stats.categoryFrequency : stats.tagFrequency;

    return Object.entries(frequency).map(([name, value]) => ({
      subject: name,
      frequency: value,
    }));
  };

  const students = users.filter(user => user.role === 'user');

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="mt-2 text-slate-400">
            Manage gym users, trainers, administrators and view student training analytics
          </p>
        </div>
        {viewMode === 'manage' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Add User
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-900/50 border border-red-700 p-4">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {/* View Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-slate-700">
        <button
          onClick={() => {
            setViewMode('manage');
            setSelectedStudent(null);
          }}
          className={`px-6 py-3 font-medium transition-all ${
            viewMode === 'manage'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Users
          </div>
        </button>
        <button
          onClick={() => setViewMode('students')}
          className={`px-6 py-3 font-medium transition-all ${
            viewMode === 'students'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Student Analytics
          </div>
        </button>
      </div>

      {/* Manage Users View */}
      {viewMode === 'manage' && (
        <>
          <div className="mb-6 flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <label className="text-sm font-medium text-slate-300">Filter by Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="user">User</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="mt-2 text-slate-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-white mb-2">No Users Yet</h3>
              <p className="text-slate-400 mb-6">Get started by adding your first user</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Add User
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {user.name} {user.surname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-400">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-900/50 text-purple-200 border border-purple-700' :
                            user.role === 'trainer' ? 'bg-blue-900/50 text-blue-200 border border-blue-700' :
                            'bg-slate-700 text-slate-200 border border-slate-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                            user.isActive ? 'bg-green-900/50 text-green-200 border border-green-700' : 'bg-red-900/50 text-red-200 border border-red-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Students Analytics View */}
      {viewMode === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Students</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {students.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-sm">No students found</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedStudent?._id === student._id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="font-medium">
                        {student.name} {student.surname}
                      </div>
                      <div className="text-xs mt-1 opacity-80">
                        {student.email}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Student Profile */}
          <div className="lg:col-span-2">
            {!selectedStudent ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Select a Student</h3>
                <p className="text-slate-400">Choose a student from the list to view their training analytics</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedStudent.name} {selectedStudent.surname}
                      </h2>
                      <p className="text-slate-400 mt-1">{selectedStudent.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-400">
                        {studentSessions.length}
                      </div>
                      <div className="text-sm text-slate-400">Sessions Attended</div>
                    </div>
                  </div>
                </div>

                {/* Training Statistics */}
                {getStudentStats() && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="text-2xl font-bold text-blue-400">
                          {Object.keys(getStudentStats()!.exerciseFrequency).length}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Unique Exercises</div>
                      </div>
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="text-2xl font-bold text-green-400">
                          {Object.keys(getStudentStats()!.categoryFrequency).length}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Categories Trained</div>
                      </div>
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="text-2xl font-bold text-purple-400">
                          {Object.values(getStudentStats()!.exerciseFrequency).reduce((a, b) => a + b, 0)}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">Total Exercises</div>
                      </div>
                    </div>

                    {/* Spider Chart */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Training Distribution</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setChartType('category')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              chartType === 'category'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            By Category
                          </button>
                          <button
                            onClick={() => setChartType('tag')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              chartType === 'tag'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            By Tag
                          </button>
                        </div>
                      </div>
                      {getChartData().length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={getChartData()}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Radar
                              name="Frequency"
                              dataKey="frequency"
                              stroke="#6366f1"
                              fill="#6366f1"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-sm">No training data available</p>
                        </div>
                      )}
                    </div>

                    {/* Top Exercises */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Most Practiced Exercises</h3>
                      <div className="space-y-3">
                        {Object.entries(getStudentStats()!.exerciseFrequency)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([exercise, count]) => (
                            <div key={exercise} className="flex items-center justify-between">
                              <span className="text-slate-300">{exercise}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{
                                      width: `${(count / Math.max(...Object.values(getStudentStats()!.exerciseFrequency))) * 100}%`
                                    }}
                                  />
                                </div>
                                <span className="text-indigo-400 font-semibold w-8 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {!getStudentStats() && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-medium text-white mb-2">No Training Data</h3>
                    <p className="text-slate-400">This student hasn't attended any sessions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingUser ? 'Edit User' : 'Create User'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Surname</label>
                  <input
                    type="text"
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 rounded-lg border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
