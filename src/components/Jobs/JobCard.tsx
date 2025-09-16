import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Archive, ArchiveRestore, MapPin, Clock, Tag, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onToggleStatus: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onToggleStatus }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {job.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  job.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}
              >
                {job.status}
              </span>
            </div>
            
            {job.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {job.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </div>
              )}
              {job.type && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.type}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-md"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Link
            to={`/assessments/${job.id}`}
            state={{ from: 'jobs', jobId: job.id }}
            className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
            title="Manage assessment"
          >
            <FileText className="w-4 h-4" />
          </Link>
          
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit job"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onToggleStatus(job)}
            className={`p-2 rounded-lg transition-colors ${
              job.status === 'active'
                ? 'text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            title={job.status === 'active' ? 'Archive job' : 'Restore job'}
          >
            {job.status === 'active' ? (
              <Archive className="w-4 h-4" />
            ) : (
              <ArchiveRestore className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;