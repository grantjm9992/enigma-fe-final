import { useState, useEffect } from 'react';
import type { Routine, CreateRoutineDto, Exercise, EmbeddedExercise } from '../types/api';
import { routinesApi, exercisesApi } from '../services/api';

export default function Routines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateRoutineDto>({
    name: '',
    description: '',
    exercises: [],
    difficulty: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routinesRes, exercisesRes] = await Promise.all([
        routinesApi.getAll(),
        exercisesApi.getAll(),
      ]);
      setRoutines(routinesRes.data);
      setExercises(exercisesRes.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoutine) {
        await routinesApi.update(editingRoutine._id, formData);
      } else {
        await routinesApi.create(formData);
      }
      closeModal();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save routine');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;
    try {
      await routinesApi.delete(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete routine');
    }
  };

  const openCreateModal = () => {
    setEditingRoutine(null);
    setFormData({
      name: '',
      description: '',
      exercises: [],
      difficulty: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setFormData({
      name: routine.name,
      description: routine.description || '',
      exercises: routine.exercises || [],
      difficulty: routine.difficulty || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  };

  const openExercisePicker = () => {
    setSearchTerm('');
    setIsExercisePickerOpen(true);
  };

  const closeExercisePicker = () => {
    setIsExercisePickerOpen(false);
  };

  const addExerciseFromLibrary = (exercise: Exercise) => {
    const newExercise: EmbeddedExercise = {
      name: exercise.name,
      category: exercise.category?.name || '',
      tags: exercise.tags?.map((t) => t.name) || [],
      duration: exercise.duration,
      description: exercise.description || '',
      videoUrl: exercise.videoUrl || '',
      sets: 3,
      reps: 10,
      restTime: 60,
      notes: '',
    };
    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise],
    });
    closeExercisePicker();
  };

  const removeExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const updateExercise = (index: number, field: keyof EmbeddedExercise, value: any) => {
    const updated = [...formData.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, exercises: updated });
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...formData.exercises];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setFormData({ ...formData, exercises: updated });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6 mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Routines</h1>
            <p className="mt-2 text-sm text-slate-400">
              Build workout routines from exercises
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/50 transition-all"
            >
              <span className="mr-2">+</span> Add Routine
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/50 border border-red-700 p-4">
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {routines.map((routine) => (
            <div
              key={routine._id}
              className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{routine.name}</h3>
                    {routine.description && (
                      <p className="mt-1 text-sm text-slate-400">{routine.description}</p>
                    )}
                  </div>
                  {routine.difficulty && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      {routine.difficulty}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <p>
                    <span className="font-semibold text-slate-300">Exercises:</span>{' '}
                    {routine.exercises?.length || 0}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-300">Total Duration:</span>{' '}
                    {formatDuration(routine.totalDuration || 0)}
                  </p>
                </div>

                {routine.exercises && routine.exercises.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-300 mb-2">Exercise List:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {routine.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-slate-400 bg-slate-700/50 rounded px-3 py-2"
                        >
                          {idx + 1}. {ex.name}
                          {ex.sets && ex.sets > 1 && ` • ${ex.sets} sets`}
                          {ex.reps && ex.reps > 0 && ` • ${ex.reps} reps`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => openEditModal(routine)}
                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(routine._id)}
                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Routine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10">
              <h2 className="text-2xl font-semibold text-white">
                {editingRoutine ? 'Edit Routine' : 'Create Routine'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Morning Cardio Routine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe this routine..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Exercises Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-slate-300">
                      Exercises ({formData.exercises.length})
                    </label>
                    <button
                      type="button"
                      onClick={openExercisePicker}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg shadow-lg transition-all"
                    >
                      + Add Exercise
                    </button>
                  </div>

                  {formData.exercises.length === 0 ? (
                    <div className="text-center py-12 bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg">
                      <p className="text-slate-400">No exercises added yet</p>
                      <p className="text-sm text-slate-500 mt-1">Click "Add Exercise" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`bg-slate-700 border border-slate-600 rounded-lg p-4 cursor-move hover:border-indigo-500 transition-all ${
                            draggedIndex === idx ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Drag Handle */}
                            <div className="flex-shrink-0 text-slate-400 mt-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                              </svg>
                            </div>

                            {/* Exercise Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-slate-300">#{idx + 1}</span>
                                <h4 className="text-white font-semibold">{ex.name}</h4>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Sets</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={ex.sets || 1}
                                    onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white text-sm rounded focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Reps</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={ex.reps || 0}
                                    onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white text-sm rounded focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Rest (s)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={ex.restTime || 0}
                                    onChange={(e) => updateExercise(idx, 'restTime', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white text-sm rounded focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Duration</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={ex.duration || 0}
                                    onChange={(e) => updateExercise(idx, 'duration', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white text-sm rounded focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>

                              <div className="mt-3">
                                <input
                                  type="text"
                                  value={ex.notes || ''}
                                  onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                                  placeholder="Add notes..."
                                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white text-sm rounded focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                                />
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeExercise(idx)}
                              className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                >
                  {editingRoutine ? 'Update' : 'Create'} Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-4">Select Exercise</h2>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise._id}
                    type="button"
                    onClick={() => addExerciseFromLibrary(exercise)}
                    className="text-left p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-indigo-500 rounded-lg transition-all group"
                  >
                    <h4 className="font-semibold text-white group-hover:text-indigo-400 mb-1">
                      {exercise.name}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {exercise.category?.name || 'Uncategorized'} • {formatDuration(exercise.duration)}
                    </p>
                    {exercise.tags && exercise.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exercise.tags.map((tag) => (
                          <span
                            key={tag._id}
                            className="px-2 py-0.5 text-xs rounded-full bg-slate-600 text-slate-300"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {filteredExercises.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No exercises found
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700">
              <button
                type="button"
                onClick={closeExercisePicker}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
