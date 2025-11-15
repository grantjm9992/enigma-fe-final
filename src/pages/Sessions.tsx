import { useState, useEffect } from 'react';
import type { Session, CreateSessionDto, Routine, User } from '../types/api';
import { sessionsApi, routinesApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Sessions() {
  const { user } = useAuth();
  const isAdminOrTrainer = user?.role === 'admin' || user?.role === 'trainer';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoutinePickerOpen, setIsRoutinePickerOpen] = useState(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [viewingSession, setViewingSession] = useState<Session | null>(null);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  // Regular users always see calendar view
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(isAdminOrTrainer ? 'list' : 'calendar');
  const [calendarViewType, setCalendarViewType] = useState<'day' | '3day' | '7day' | 'month'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState<CreateSessionDto>({
    name: '',
    description: '',
    date: '',
    duration: 3600, // 60 minutes in seconds
    instructorId: '',
    attendeeIds: [],
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
      const [routinesRes, trainersRes, studentsRes] = await Promise.all([
        routinesApi.getAll(),
        usersApi.getAll('trainer'),
        usersApi.getAll('user'),
      ]);
      setRoutines(routinesRes.data);
      setTrainers(trainersRes.data);
      setStudents(studentsRes.data);
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

  const openCreateModal = () => {
    setEditingSession(null);
    setFormData({
      name: '',
      description: '',
      date: '',
      duration: 3600, // 60 minutes in seconds
      instructorId: trainers[0]?._id || '',
      attendeeIds: [],
      routines: [],
      location: '',
      maxParticipants: 0,
      status: 'scheduled',
    });
    setIsModalOpen(true);
  };

  const convertToDatetimeLocal = (isoDate: string) => {
    // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      description: session.description || '',
      date: convertToDatetimeLocal(session.date),
      duration: session.duration || 3600, // 60 minutes in seconds
      instructorId: session.instructorId,
      attendeeIds: session.attendeeIds || [],
      routines: session.routines || [],
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
    setStudentSearchTerm('');
  };

  const handleSessionClick = (session: Session) => {
    if (isAdminOrTrainer) {
      openEditModal(session);
    } else {
      setViewingSession(session);
    }
  };

  const closeViewSession = () => {
    setViewingSession(null);
  };

  const addRoutine = (routine: Routine) => {
    // Check if routine is already added by _id
    const isAlreadyAdded = formData.routines?.some((r) => r._id === routine._id);
    if (!isAlreadyAdded) {
      setFormData({
        ...formData,
        routines: [...(formData.routines || []), routine],
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

  const addStudent = (studentId: string) => {
    // Check if student is already added
    const isAlreadyAdded = formData.attendeeIds?.includes(studentId);
    if (!isAlreadyAdded) {
      setFormData({
        ...formData,
        attendeeIds: [...(formData.attendeeIds || []), studentId],
      });
    }
  };

  const removeStudent = (studentId: string) => {
    const updated = formData.attendeeIds?.filter(id => id !== studentId) || [];
    setFormData({ ...formData, attendeeIds: updated });
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
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
    setCurrentDate(new Date());
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const getDaysForView = () => {
    const days: Date[] = [];
    if (calendarViewType === 'day') {
      days.push(new Date(currentDate));
    } else if (calendarViewType === '3day') {
      for (let i = 0; i < 3; i++) {
        const day = new Date(currentDate);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    } else if (calendarViewType === '7day') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
    }
    return days;
  };

  const getSessionsForTimeSlot = (day: Date, hour: number) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === day.getFullYear() &&
        sessionDate.getMonth() === day.getMonth() &&
        sessionDate.getDate() === day.getDate() &&
        sessionDate.getHours() === hour
      );
    });
  };

  const getSessionPosition = (sessionDate: Date) => {
    const minutes = sessionDate.getMinutes();
    return (minutes / 60) * 100; // percentage within the hour
  };

  const filteredRoutines = routines.filter(
    (routine) =>
      routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.surname.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white">Training Sessions</h1>
          <p className="mt-2 text-slate-400">
            {isAdminOrTrainer ? 'Schedule and manage training sessions with routines' : 'View and sign up for training sessions'}
          </p>
        </div>
        {isAdminOrTrainer && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Schedule Session
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-900/50 border border-red-700 p-4">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {/* View Tabs - Only show for admins/trainers */}
      {isAdminOrTrainer && (
        <div className="mb-6 flex space-x-2 border-b border-slate-700">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 font-medium transition-all ${
              viewMode === 'list'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List View
            </div>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-3 font-medium transition-all ${
              viewMode === 'calendar'
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar View
            </div>
          </button>
        </div>
      )}

      {/* Date Filters - Only show in list view */}
      {viewMode === 'list' && (
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
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          {/* Calendar View Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setCalendarViewType('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                calendarViewType === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCalendarViewType('3day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                calendarViewType === '3day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              3 Days
            </button>
            <button
              onClick={() => setCalendarViewType('7day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                calendarViewType === '7day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarViewType('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                calendarViewType === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Month
            </button>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {calendarViewType === 'month'
                ? currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : calendarViewType === '7day'
                ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Today
              </button>
              <button
                onClick={
                  calendarViewType === 'month'
                    ? previousMonth
                    : calendarViewType === '7day'
                    ? previousWeek
                    : previousDay
                }
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={
                  calendarViewType === 'month'
                    ? nextMonth
                    : calendarViewType === '7day'
                    ? nextWeek
                    : nextDay
                }
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Month View */}
          {calendarViewType === 'month' && (
            <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="bg-slate-800 p-3 text-center text-sm font-semibold text-slate-400"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {getDaysInMonth(currentMonth).map((day, index) => {
                const daySessions = day ? getSessionsForDay(day) : [];
                const isToday =
                  day &&
                  day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`bg-slate-800 min-h-[120px] p-2 ${
                      !day ? 'bg-slate-900' : ''
                    } ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-2 ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {daySessions.slice(0, 3).map((session) => (
                            <button
                              key={session._id}
                              onClick={() => handleSessionClick(session)}
                              className="w-full text-left px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded text-xs text-indigo-300 transition-colors"
                            >
                              <div className="font-medium truncate">{formatTime(session.date)}</div>
                              <div className="truncate">{session.name}</div>
                            </button>
                          ))}
                          {daySessions.length > 3 && (
                            <div className="text-xs text-slate-500 px-2">
                              +{daySessions.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Time Grid View (Day, 3 Days, Week) */}
          {calendarViewType !== 'month' && (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day headers */}
                <div className="grid gap-px bg-slate-700 rounded-t-lg overflow-hidden" style={{ gridTemplateColumns: `60px repeat(${getDaysForView().length}, 1fr)` }}>
                  <div className="bg-slate-800 p-3"></div>
                  {getDaysForView().map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={index}
                        className={`bg-slate-800 p-3 text-center ${isToday ? 'bg-indigo-900/30' : ''}`}
                      >
                        <div className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold ${isToday ? 'text-indigo-300' : 'text-white'}`}>
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots grid */}
                <div className="relative">
                  {getTimeSlots().map((hour) => (
                    <div
                      key={hour}
                      className="grid gap-px bg-slate-700"
                      style={{ gridTemplateColumns: `60px repeat(${getDaysForView().length}, 1fr)` }}
                    >
                      {/* Time label */}
                      <div className="bg-slate-800 p-2 text-right pr-3 border-r border-slate-700">
                        <span className="text-xs font-medium text-slate-400">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>

                      {/* Time slot cells for each day */}
                      {getDaysForView().map((day, dayIndex) => {
                        const sessionsInSlot = getSessionsForTimeSlot(day, hour);
                        return (
                          <div
                            key={dayIndex}
                            className="bg-slate-800 min-h-[60px] p-1 relative border-t border-slate-700"
                          >
                            {sessionsInSlot.map((session) => {
                              const sessionDate = new Date(session.date);
                              const topPosition = getSessionPosition(sessionDate);
                              const durationHeight = session.duration ? (session.duration / 60) : 60; // 60px per hour, duration in seconds

                              return (
                                <button
                                  key={session._id}
                                  onClick={() => handleSessionClick(session)}
                                  className="absolute left-1 right-1 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded px-2 py-1 text-left transition-colors overflow-hidden"
                                  style={{
                                    top: `${topPosition}%`,
                                    height: `${Math.min(durationHeight, 60 - (topPosition / 100) * 60)}px`,
                                  }}
                                >
                                  <div className="text-xs font-semibold text-white truncate">
                                    {formatTime(session.date)}
                                  </div>
                                  <div className="text-xs text-indigo-100 truncate">
                                    {session.name}
                                  </div>
                                  {session.duration && (
                                    <div className="text-xs text-indigo-200">
                                      {Math.round(session.duration / 60)} min
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        loading ? (
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
                        {session.attendeeIds?.length || 0}
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
        )
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

                {/* Date, Duration and Status */}
                <div className="grid grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={900}>15 minutes</option>
                      <option value={1800}>30 minutes</option>
                      <option value={2700}>45 minutes</option>
                      <option value={3600}>1 hour</option>
                      <option value={4500}>1 hour 15 minutes</option>
                      <option value={5400}>1 hour 30 minutes</option>
                      <option value={6300}>1 hour 45 minutes</option>
                      <option value={7200}>2 hours</option>
                    </select>
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

                {/* Students/Participants */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Participants ({formData.attendeeIds?.length || 0}
                      {formData.maxParticipants ? ` / ${formData.maxParticipants}` : ''})
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsStudentPickerOpen(true)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add Students
                    </button>
                  </div>

                  {formData.attendeeIds && formData.attendeeIds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {formData.attendeeIds.map((studentId) => {
                        const student = students.find(s => s._id === studentId);
                        if (!student) return null;
                        return (
                          <div
                            key={studentId}
                            className="flex items-center bg-slate-700 border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-all"
                          >
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {student.name} {student.surname}
                              </p>
                              <p className="text-xs text-slate-400">{student.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStudent(studentId)}
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
                      <div className="text-3xl mb-2">👥</div>
                      <p className="text-sm text-slate-400">No participants added yet</p>
                      <button
                        type="button"
                        onClick={() => setIsStudentPickerOpen(true)}
                        className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      >
                        Add students to this session
                      </button>
                    </div>
                  )}
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
                      {formData.routines.map((routine, index) => (
                        <div
                          key={routine._id}
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
                      ))}
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
                  const isAdded = formData.routines?.some((r) => r._id === routine._id);
                  return (
                    <button
                      key={routine._id}
                      type="button"
                      onClick={() => addRoutine(routine)}
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

      {/* Student Picker Modal */}
      {isStudentPickerOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Select Students</h3>
              <button
                onClick={() => {
                  setIsStudentPickerOpen(false);
                  setStudentSearchTerm('');
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
              placeholder="Search students by name or email..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="mb-4 block w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-slate-400">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isAdded = formData.attendeeIds?.includes(student._id);
                  return (
                    <button
                      key={student._id}
                      type="button"
                      onClick={() => {
                        if (!isAdded) {
                          addStudent(student._id);
                        }
                      }}
                      disabled={isAdded}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isAdded
                          ? 'bg-slate-700/50 border-slate-600 opacity-50 cursor-not-allowed'
                          : 'bg-slate-700 border-slate-600 hover:border-indigo-500 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            {student.name} {student.surname}
                          </h4>
                          <p className="text-sm text-slate-400">{student.email}</p>
                          <p className="text-xs text-slate-500">{student.phone}</p>
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

            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
              <p className="text-sm text-slate-400">
                {formData.attendeeIds?.length || 0} student(s) selected
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsStudentPickerOpen(false);
                  setStudentSearchTerm('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Session Modal - For regular users */}
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

              <div className="flex items-center text-slate-300">
                <span className="text-lg mr-3">👤</span>
                <span className="font-medium mr-2">Instructor:</span>
                <span className="text-slate-400">
                  {(() => {
                    const trainer = trainers.find((t) => t._id === viewingSession.instructorId);
                    return trainer ? `${trainer.name} ${trainer.surname}` : 'Unknown';
                  })()}
                </span>
              </div>

              <div className="flex items-center text-slate-300">
                <span className="text-lg mr-3">👥</span>
                <span className="font-medium mr-2">Participants:</span>
                <span className="text-slate-400">
                  {viewingSession.attendeeIds?.length || 0}
                  {viewingSession.maxParticipants ? ` / ${viewingSession.maxParticipants}` : ''}
                </span>
              </div>
            </div>

            {viewingSession.routines && viewingSession.routines.length > 0 && (
              <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-3">Routines</h3>
                <ul className="space-y-2">
                  {viewingSession.routines.map((routine, idx) => (
                    <li key={idx} className="flex items-center text-sm bg-slate-600/50 rounded-lg px-3 py-2">
                      <span className="text-lg mr-2">📋</span>
                      <div className="flex-1">
                        <span className="text-white font-medium">{routine.name}</span>
                        <span className="text-slate-400 ml-2">({routine.exercises?.length || 0} exercises)</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-slate-700">
              {(() => {
                const isSignedUp = viewingSession.attendeeIds?.includes(user?._id || '');
                console.log('DEBUG: User ID:', user?._id);
                console.log('DEBUG: Attendee IDs:', viewingSession.attendeeIds);
                console.log('DEBUG: Is signed up:', isSignedUp);

                if (isSignedUp) {
                  return (
                    <button
                      onClick={() => {
                        handleRemove(viewingSession._id);
                        closeViewSession();
                      }}
                      className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                    >
                      Leave Session
                    </button>
                  );
                } else if (viewingSession.maxParticipants && viewingSession.attendeeIds && viewingSession.attendeeIds.length >= viewingSession.maxParticipants) {
                  return (
                    <div className="text-center py-3 text-slate-400">
                      <p className="font-medium">Session is Full</p>
                      <p className="text-sm">This session has reached maximum capacity</p>
                    </div>
                  );
                } else {
                  return (
                    <button
                      onClick={() => {
                        handleSignup(viewingSession._id);
                        closeViewSession();
                      }}
                      className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                      Sign Up for Session
                    </button>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
