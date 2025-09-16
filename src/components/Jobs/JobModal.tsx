import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';
import { X, Plus, Trash2 } from 'lucide-react';
import { Job } from '../../types';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
  onSave: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose, onSave }) => {
  const { addNotification } = useNotification();
  const { user } = useUser();
  const isReadOnly = user.role === 'readonly';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract',
    tags: [] as string[],
    requirements: [] as string[],
    status: 'active' as 'active' | 'archived'
  });
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description || '',
        location: job.location || '',
        type: job.type || 'full-time',
        tags: job.tags,
        requirements: job.requirements || [],
        status: job.status
      });
    }
  }, [job]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if (!job) {
          addNotification({
            message: `${user.name} added a job: ${formData.title}`,
            time: new Date().toLocaleTimeString()
          });
        }
        onSave();
      }
    } catch (error) {
      console.error('Failed to save job:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Senior Frontend Developer"
              disabled={isReadOnly}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Job description..."
              disabled={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Remote, San Francisco"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isReadOnly}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 p-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    disabled={isReadOnly}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add a tag..."
                disabled={isReadOnly}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isReadOnly}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requirements
            </label>
            <div className="space-y-2 mb-3">
              {formData.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{requirement}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={isReadOnly}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add a requirement..."
                disabled={isReadOnly}
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isReadOnly}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isReadOnly}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isReadOnly ? 'Read Only' : loading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;