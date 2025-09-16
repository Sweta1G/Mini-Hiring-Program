import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Mail, UserCheck } from 'lucide-react';
import { Candidate } from '../../types';

interface KanbanCardProps {
  candidate: Candidate;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ candidate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 rotate-5 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </span>
        </div>
        {candidate.referred && (
          <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
            <UserCheck className="w-3 h-3" />
          </span>
        )}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
          {candidate.name}
        </h4>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Mail className="w-3 h-3 mr-1" />
          <span className="truncate">{candidate.email}</span>
        </div>
        
        {candidate.referredBy && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Referred by: {candidate.referredBy}
          </p>
        )}

        <Link
          to={`/candidates/${candidate.id}`}
          className="inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default KanbanCard;