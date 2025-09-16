import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Archive, ArchiveRestore } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Job } from '../../types';
import JobCard from './JobCard';
import JobModal from './JobModal';


const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'full-time' | 'part-time' | 'contract'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Dropdown state for tag filter
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showTagDropdown) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only close if click is outside the dropdown and button
      if (!target.closest('.relative')) setShowTagDropdown(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showTagDropdown]);



  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchJobs = async () => {
    setLoading(true);
    try {

      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        type: typeFilter === 'all' ? '' : typeFilter,
        location: locationFilter === 'all' ? '' : locationFilter,
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sort: 'order'
      });
      // Add all selected tags as repeated 'tag' params
      tagFilter.forEach(tag => params.append('tag', tag));

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();
      
      setJobs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, statusFilter, typeFilter, locationFilter, tagFilter, pagination.page]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = jobs.findIndex(job => job.id === active.id);
      const newIndex = jobs.findIndex(job => job.id === over.id);
      
      const newJobs = arrayMove(jobs, oldIndex, newIndex);
      const reorderedJobs = newJobs.map((job, index) => ({
        ...job,
        order: index + 1
      }));
      
      // Optimistic update
      setJobs(reorderedJobs);
      
      try {
        const response = await fetch(`/api/jobs/${active.id}/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromOrder: jobs[oldIndex].order,
            toOrder: jobs[newIndex].order
          })
        });

        if (!response.ok) {
          // Rollback on error
          setJobs(jobs);
        }
      } catch (error) {
        // Rollback on error
        setJobs(jobs);
      }
    }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const handleSaveJob = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage job postings and requirements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Locations</option>
          <option value="Remote">Remote</option>
          <option value="San Francisco">San Francisco</option>
          <option value="New York">New York</option>
          <option value="London">London</option>
        </select>
        <div className="relative">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center min-w-[120px]"
            onClick={() => setShowTagDropdown(v => !v)}
          >
            {tagFilter.length === 0 ? 'All Tags' : `${tagFilter.length} tag${tagFilter.length > 1 ? 's' : ''} selected`}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showTagDropdown && (
            <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 flex flex-col gap-1">
              <div className="flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                  onClick={() => setTagFilter([])}
                  disabled={tagFilter.length === 0}
                >
                  Clear All
                </button>
              </div>
              {[
                'React', 'TypeScript', 'Frontend', 'Node.js', 'Python', 'Backend', 'Product', 'Strategy',
                'Design', 'UX/UI', 'DevOps', 'Cloud', 'ML', 'React Native', 'iOS', 'Testing', 'Automation',
                'Security', 'Compliance', 'Marketing', 'Growth', 'Sales', 'B2B', 'Support', 'Customer',
                'Documentation', 'Technical', 'HR', 'Recruitment'
              ].map(tag => (
                <label key={tag} className="flex items-center space-x-2 text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tagFilter.includes(tag)}
                    onChange={e => {
                      if (e.target.checked) {
                        setTagFilter(prev => [...prev, tag]);
                      } else {
                        setTagFilter(prev => prev.filter(t => t !== tag));
                      }
                    }}
                    className="accent-blue-600"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>



      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-lg">
                  Not found
                </div>
              ) : (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={(job) => {
                      setEditingJob(job);
                      setIsModalOpen(true);
                    }}
                    onToggleStatus={() => handleToggleStatus(job)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
};

export default JobsList;