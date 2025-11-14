import { useState, useEffect } from 'react';
import type { Session, CreateSessionDto, Routine, User } from '../types/api';
import { sessionsApi, routinesApi, usersApi } from '../services/api';

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [formData, setFormData] = useState<CreateSessionDto>({
    name: '',
    description: '',
    scheduledDate: '',
    instructor: '',
    participants: [],
    routines: [],
    location: '',
    maxParticipants: 0,
    status: 'scheduled',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSessions();
  }, [startDateFilter, endDateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routinesRes, trainersRes] = await Promise.all([
        routinesApi.getAll(),
        usersApi.getAll('trainer'),
      ]);
      setRoutines(routinesRes.data);
      setTrainers(trainersRes.data);
      await loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await sessionsApi.getAll(
        startDateFilter || undefined,
        endDateFilter || undefined
      );
      setSessions(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await sessionsApi.update(editingSession._id, formData);
      } else {
        await sessionsApi.create(formData);
      }
      closeModal();
      loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save session');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await sessionsApi.delete(id);
      loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  };

  const openCreateModal = () => {
    setEditingSession(null);
    setFormData({
      name: '',
      description: '',
      scheduledDate: '',
      instructor: trainers[0]?.email || '',
      participants: [],
      routines: [],
      location: '',
      maxParticipants: 0,
      status: 'scheduled',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      description: session.description || '',
      scheduledDate: session.scheduledDate,
      instructor: session.instructor,
      participants: session.participants || [],
      routines: session.routines?.map((r) => r._id) || [],
      location: session.location || '',
      maxParticipants: session.maxParticipants || 0,
      status: session.status || 'scheduled',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const toggleRoutine = (routineId: string) => {
    setFormData({
      ...formData,
      routines: formData.routines?.includes(routineId)
        ? formData.routines.filter((id) => id !== routineId)
        : [...(formData.routines || []), routineId],
    });
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Training Sessions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Schedule and manage training sessions with routines
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Schedule Session
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Start Date:</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">End Date:</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {(startDateFilter || endDateFilter) && (
          <button
            onClick={() => {
              setStartDateFilter('');
              setEndDateFilter('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sessions.map((session) => {
            const trainer = trainers.find((t) => t.email === session.instructor);
            return (
              <div
                key={session._id}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{session.name}</h3>
                      {session.description && (
                        <p className="mt-1 text-sm text-gray-500">{session.description}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        session.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {session.status || 'scheduled'}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500 space-y-1">
                    <p>
                      <span className="font-semibold">Date:</span>{' '}
                      {formatDate(session.scheduledDate)}
                    </p>
                    <p>
                      <span className="font-semibold">Instructor:</span>{' '}
                      {trainer ? `${trainer.name} ${trainer.surname}` : session.instructor}
                    </p>
                    {session.location && (
                      <p>
                        <span className="font-semibold">Location:</span> {session.location}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Participants:</span>{' '}
                      {session.participants?.length || 0}
                      {session.maxParticipants ? ` / ${session.maxParticipants}` : ''}
                    </p>
                    <p>
                      <span className="font-semibold">Routines:</span>{' '}
                      {session.routines?.length || 0}
                    </p>
                  </div>
                  {session.routines && session.routines.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Routines:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {session.routines.map((routine, idx) => (
                          <li key={idx}>
                            • {routine.name} ({routine.exercises?.length || 0} exercises)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => openEditModal(session)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingSession ? 'Edit Session' : 'Schedule Session'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor</label>
                    <select
                      required
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select instructor</option>
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer.email}>
                          {trainer.name} {trainer.surname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Routines</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {routines.map((routine) => (
                      <label
                        key={routine._id}
                        className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.routines?.includes(routine._id)}
                          onChange={() => toggleRoutine(routine._id)}
                          className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{routine.name}</p>
                          {routine.description && (
                            <p className="text-xs text-gray-500">{routine.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {routine.exercises?.length || 0} exercises
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {editingSession ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
