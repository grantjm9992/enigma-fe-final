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
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateRoutineDto>({
    name: '',
    description: '',
    exercises: [],
    difficulty: '',
  });

  const [exerciseForm, setExerciseForm] = useState<EmbeddedExercise>({
    name: '',
    category: '',
    tags: [],
    duration: 0,
    description: '',
    videoUrl: '',
    sets: 1,
    reps: 0,
    restTime: 0,
    notes: '',
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

  const openExercisePicker = (index?: number) => {
    if (index !== undefined) {
      setEditingExerciseIndex(index);
      setExerciseForm(formData.exercises[index]);
    } else {
      setEditingExerciseIndex(null);
      setExerciseForm({
        name: '',
        category: '',
        tags: [],
        duration: 0,
        description: '',
        videoUrl: '',
        sets: 1,
        reps: 0,
        restTime: 0,
        notes: '',
      });
    }
    setIsExercisePickerOpen(true);
  };

  const closeExercisePicker = () => {
    setIsExercisePickerOpen(false);
    setEditingExerciseIndex(null);
  };

  const selectExercise = (exercise: Exercise) => {
    setExerciseForm({
      name: exercise.name,
      category: exercise.category?.name || '',
      tags: exercise.tags?.map((t) => t.name) || [],
      duration: exercise.duration,
      description: exercise.description || '',
      videoUrl: exercise.videoUrl || '',
      sets: 1,
      reps: 0,
      restTime: 0,
      notes: '',
    });
  };

  const saveExerciseToRoutine = () => {
    if (editingExerciseIndex !== null) {
      const updated = [...formData.exercises];
      updated[editingExerciseIndex] = exerciseForm;
      setFormData({ ...formData, exercises: updated });
    } else {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, exerciseForm],
      });
    }
    closeExercisePicker();
  };

  const removeExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Routines</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create workout routines from exercises
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Add Routine
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {routines.map((routine) => (
            <div
              key={routine._id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{routine.name}</h3>
                {routine.description && (
                  <p className="mt-1 text-sm text-gray-500">{routine.description}</p>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    <span className="font-semibold">Exercises:</span> {routine.exercises?.length || 0}
                  </p>
                  <p>
                    <span className="font-semibold">Total Duration:</span>{' '}
                    {formatDuration(routine.totalDuration || 0)}
                  </p>
                  {routine.difficulty && (
                    <p>
                      <span className="font-semibold">Difficulty:</span> {routine.difficulty}
                    </p>
                  )}
                </div>
                {routine.exercises && routine.exercises.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Exercises:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {routine.exercises.map((ex, idx) => (
                        <li key={idx}>
                          {idx + 1}. {ex.name} ({formatDuration(ex.duration)})
                          {ex.sets && ex.sets > 1 && ` - ${ex.sets} sets`}
                          {ex.reps && ex.reps > 0 && ` x ${ex.reps} reps`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => openEditModal(routine)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(routine._id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingRoutine ? 'Edit Routine' : 'Create Routine'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Exercises</label>
                    <button
                      type="button"
                      onClick={() => openExercisePicker()}
                      className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      + Add Exercise
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDuration(ex.duration)}
                            {ex.sets && ex.sets > 1 && ` • ${ex.sets} sets`}
                            {ex.reps && ex.reps > 0 && ` • ${ex.reps} reps`}
                            {ex.restTime && ex.restTime > 0 && ` • ${ex.restTime}s rest`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => openExercisePicker(idx)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExercise(idx)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.exercises.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No exercises added yet</p>
                    )}
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
                  {editingRoutine ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExercisePickerOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingExerciseIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or select from existing exercises:
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                {exercises.map((exercise) => (
                  <button
                    key={exercise._id}
                    type="button"
                    onClick={() => selectExercise(exercise)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-200"
                  >
                    <p className="text-sm font-medium">{exercise.name}</p>
                    <p className="text-xs text-gray-500">{formatDuration(exercise.duration)}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={exerciseForm.name}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={exerciseForm.duration}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, duration: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={exerciseForm.sets || 1}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reps</label>
                  <input
                    type="number"
                    min="0"
                    value={exerciseForm.reps || 0}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, reps: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rest Time (s)</label>
                  <input
                    type="number"
                    min="0"
                    value={exerciseForm.restTime || 0}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, restTime: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeExercisePicker}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveExerciseToRoutine}
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {editingExerciseIndex !== null ? 'Update Exercise' : 'Add Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
