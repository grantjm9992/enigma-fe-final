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
  const [isRoutinePickerOpen, setIsRoutinePickerOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateSessionDto>({
    name: '',
    description: '',
    date: '',
    instructorId: '',
    participantIds: [],
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
      date: '',
      instructorId: trainers[0]?._id || '',
      participantIds: [],
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
      date: session.date,
      instructorId: session.instructorId,
      participantIds: session.participantIds || [],
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
    setSearchTerm('');
  };

  const addRoutine = (routineId: string) => {
    if (!formData.routines?.includes(routineId)) {
      setFormData({
        ...formData,
        routines: [...(formData.routines || []), routineId],
      });
    }
    setIsRoutinePickerOpen(false);
    setSearchTerm('');
  };

  const removeRoutine = (index: number) => {
    const updated = [...(formData.routines || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, routines: updated });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...(formData.routines || [])];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setFormData({ ...formData, routines: updated });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

  const getRoutineById = (id: string) => {
    return routines.find((r) => r._id === id);
  };

  const filteredRoutines = routines.filter(
    (routine) =>
      routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white">Training Sessions</h1>
          <p className="mt-2 text-slate-400">
            Schedule and manage training sessions with routines
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Schedule Session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-900/50 border border-red-700 p-4">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {/* Date Filters */}
      <div className="mb-6 flex flex-wrap gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        {(startDateFilter || endDateFilter) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDateFilter('');
                setEndDateFilter('');
              }}
              className="px-4 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-slate-400">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-white mb-2">No Sessions Yet</h3>
          <p className="text-slate-400 mb-6">Get started by scheduling your first training session</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Schedule Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {sessions.map((session) => {
            const trainer = trainers.find((t) => t._id === session.instructorId);
            const statusColors = {
              scheduled: 'bg-blue-900/50 text-blue-300 border-blue-700',
              in_progress: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
              completed: 'bg-green-900/50 text-green-300 border-green-700',
              cancelled: 'bg-red-900/50 text-red-300 border-red-700',
            };

            return (
              <div
                key={session._id}
                className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 hover:border-slate-600 transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{session.name}</h3>
                      {session.description && (
                        <p className="text-sm text-slate-400">{session.description}</p>
                      )}
                    </div>
                    <span
                      className={`ml-4 inline-flex rounded-lg px-3 py-1 text-xs font-semibold border ${
                        statusColors[session.status as keyof typeof statusColors] ||
                        statusColors.scheduled
                      }`}
                    >
                      {session.status || 'scheduled'}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-slate-300">
                      <span className="text-lg mr-2">📅</span>
                      <span className="font-medium mr-2">Date:</span>
                      <span className="text-slate-400">{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <span className="text-lg mr-2">👤</span>
                      <span className="font-medium mr-2">Instructor:</span>
                      <span className="text-slate-400">
                        {trainer ? `${trainer.name} ${trainer.surname}` : 'Unknown'}
                      </span>
                    </div>
                    {session.location && (
                      <div className="flex items-center text-slate-300">
                        <span className="text-lg mr-2">📍</span>
                        <span className="font-medium mr-2">Location:</span>
                        <span className="text-slate-400">{session.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-slate-300">
                      <span className="text-lg mr-2">👥</span>
                      <span className="font-medium mr-2">Participants:</span>
                      <span className="text-slate-400">
                        {session.participantIds?.length || 0}
                        {session.maxParticipants ? ` / ${session.maxParticipants}` : ''}
                      </span>
                    </div>
                  </div>

                  {session.routines && session.routines.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm font-semibold text-slate-300 mb-2">
                        Routines ({session.routines.length})
                      </p>
                      <ul className="space-y-2">
                        {session.routines.map((routine, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600"
                          >
                            <span className="text-lg mr-2">📋</span>
                            <div className="flex-1">
                              <span className="text-white font-medium">{routine.name}</span>
                              <span className="text-slate-400 ml-2">
                                ({routine.exercises?.length || 0} exercises)
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex space-x-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={() => openEditModal(session)}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
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

      {/* Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingSession ? 'Edit Session' : 'Schedule Session'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Advanced Boxing Techniques"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of the session..."
                  />
                </div>

                {/* Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Instructor and Max Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Instructor
                    </label>
                    <select
                      required
                      value={formData.instructorId}
                      onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                      className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select instructor</option>
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer._id}>
                          {trainer.name} {trainer.surname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })
                      }
                      className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0 for unlimited"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Main Gym Floor"
                  />
                </div>

                {/* Routines */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Routines ({formData.routines?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsRoutinePickerOpen(true)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add Routine
                    </button>
                  </div>

                  {formData.routines && formData.routines.length > 0 ? (
                    <div className="space-y-2">
                      {formData.routines.map((routineId, index) => {
                        const routine = getRoutineById(routineId);
                        if (!routine) return null;

                        return (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center bg-slate-700 border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-all cursor-move ${
                              draggedIndex === index ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="text-slate-400 mr-3 cursor-grab active:cursor-grabbing">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{routine.name}</p>
                              <p className="text-xs text-slate-400">
                                {routine.exercises?.length || 0} exercises
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRoutine(index)}
                              className="ml-3 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600">
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-sm text-slate-400">No routines added yet</p>
                      <button
                        type="button"
                        onClick={() => setIsRoutinePickerOpen(true)}
                        className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      >
                        Add your first routine
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-700">
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
                  {editingSession ? 'Update Session' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routine Picker Modal */}
      {isRoutinePickerOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Select Routine</h3>
              <button
                onClick={() => {
                  setIsRoutinePickerOpen(false);
                  setSearchTerm('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <input
              type="text"
              placeholder="Search routines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredRoutines.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-slate-400">No routines found</p>
                </div>
              ) : (
                filteredRoutines.map((routine) => {
                  const isAdded = formData.routines?.includes(routine._id);
                  return (
                    <button
                      key={routine._id}
                      type="button"
                      onClick={() => addRoutine(routine._id)}
                      disabled={isAdded}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isAdded
                          ? 'bg-slate-700/50 border-slate-600 opacity-50 cursor-not-allowed'
                          : 'bg-slate-700 border-slate-600 hover:border-indigo-500 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{routine.name}</h4>
                          {routine.description && (
                            <p className="text-sm text-slate-400 mb-2">{routine.description}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            {routine.exercises?.length || 0} exercises
                          </p>
                        </div>
                        {isAdded && (
                          <span className="ml-2 text-green-400 flex-shrink-0">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
