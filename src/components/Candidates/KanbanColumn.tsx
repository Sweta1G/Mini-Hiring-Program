import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Candidate, CandidateStage } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: {
    id: CandidateStage;
    title: string;
    color: string;
  };
  candidates: Candidate[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, candidates }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getHeaderColor = (color: string) => {
    const colors = {
      blue: 'text-blue-700 dark:text-blue-300',
      yellow: 'text-yellow-700 dark:text-yellow-300',
      purple: 'text-purple-700 dark:text-purple-300',
      green: 'text-green-700 dark:text-green-300',
      emerald: 'text-emerald-700 dark:text-emerald-300',
      red: 'text-red-700 dark:text-red-300',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 transition-all duration-200 ${
        getColorClasses(column.color)
      } ${isOver ? 'border-solid shadow-lg scale-105' : 'border-dashed'}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-sm uppercase tracking-wide ${getHeaderColor(column.color)}`}>
            {column.title}
          </h3>
          <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
            {candidates.length}
          </span>
        </div>

        <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[500px]">
            {candidates.map((candidate) => (
              <KanbanCard key={candidate.id} candidate={candidate} />
            ))}
            {candidates.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                Drop candidates here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;