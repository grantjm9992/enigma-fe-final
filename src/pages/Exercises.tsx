import { useState, useEffect } from 'react';
import type { Exercise, CreateExerciseDto, ExerciseCategory, Tag } from '../types/api';
import { exercisesApi, categoriesApi, tagsApi } from '../services/api';

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const [formData, setFormData] = useState<CreateExerciseDto>({
    name: '',
    categoryId: '',
    tagIds: [],
    duration: 0,
    description: '',
    videoUrl: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadExercises();
  }, [filterCategoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, tagsRes] = await Promise.all([
        categoriesApi.getAll(),
        tagsApi.getAll(),
      ]);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      await loadExercises();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const response = await exercisesApi.getAll(filterCategoryId || undefined);
      setExercises(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exercises');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExercise) {
        await exercisesApi.update(editingExercise._id, formData);
      } else {
        await exercisesApi.create(formData);
      }
      closeModal();
      loadExercises();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save exercise');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    try {
      await exercisesApi.delete(id);
      loadExercises();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete exercise');
    }
  };

  const openCreateModal = () => {
    setEditingExercise(null);
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      tagIds: [],
      duration: 0,
      description: '',
      videoUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      categoryId: exercise.categoryId,
      tagIds: exercise.tagIds || [],
      duration: exercise.duration,
      description: exercise.description || '',
      videoUrl: exercise.videoUrl || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  const toggleTag = (tagId: string) => {
    setFormData({
      ...formData,
      tagIds: formData.tagIds?.includes(tagId)
        ? formData.tagIds.filter((id) => id !== tagId)
        : [...(formData.tagIds || []), tagId],
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
          <h1 className="text-2xl font-semibold text-gray-900">Exercises</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage boxing exercises and drills
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Add Exercise
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => {
            const category = categories.find((c) => c._id === exercise.categoryId);
            const exerciseTags = tags.filter((t) => exercise.tagIds?.includes(t._id));

            return (
              <div
                key={exercise._id}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      <span className="font-semibold">Category:</span> {category?.name || 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Duration:</span> {formatDuration(exercise.duration)}
                    </p>
                    {exercise.description && (
                      <p className="mt-1">
                        <span className="font-semibold">Description:</span> {exercise.description}
                      </p>
                    )}
                  </div>
                  {exerciseTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {exerciseTags.map((tag) => (
                        <span
                          key={tag._id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                            color: tag.color || '#6b7280',
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      View Video
                    </a>
                  )}
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => openEditModal(exercise)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exercise._id)}
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingExercise ? 'Edit Exercise' : 'Create Exercise'}
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
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          formData.tagIds?.includes(tag._id)
                            ? 'ring-2 ring-indigo-500'
                            : 'ring-1 ring-gray-300'
                        }`}
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                          color: tag.color || '#6b7280',
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Video URL</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
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
                  {editingExercise ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
