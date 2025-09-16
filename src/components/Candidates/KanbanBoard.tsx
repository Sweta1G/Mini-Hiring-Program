import React, { useState, useEffect } from 'react';
import { DndContext, useSensors, useSensor, closestCorners, PointerSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Candidate, CandidateStage } from '../../types';
import KanbanColumn from './KanbanColumn';
import { useNotification } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';

const KanbanBoard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const { addNotification } = useNotification();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  const columns: { id: CandidateStage; title: string; color: string }[] = [
    { id: 'applied', title: 'Applied', color: 'blue' },
    { id: 'screen', title: 'Screening', color: 'yellow' },
    { id: 'tech', title: 'Technical', color: 'purple' },
    { id: 'offer', title: 'Offer', color: 'green' },
    { id: 'hired', title: 'Hired', color: 'emerald' },
    { id: 'rejected', title: 'Rejected', color: 'red' },
  ];

  const isReadOnly = user.role === 'readonly';
  const sensors = isReadOnly
    ? undefined
    : useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        })
      );

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/candidates?pageSize=1000');
      const data = await response.json();
      setCandidates(data.data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find(c => c.id === event.active.id);
    console.log('Drag started:', { candidate, event });
    setActiveCandidate(candidate || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);
    console.log('Drag ended:', { active, over });

    if (!over) {
      console.log('No drop target');
      return;
    }

    const candidateId = active.id as string;
    let newStage = over.id as CandidateStage;
    const validStages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    if (!validStages.includes(newStage)) {
      // Try to find the column id from the parent droppable
      const column = columns.find(col =>
        getCandidatesByStage(col.id).some(c => c.id === over.id)
      );
      if (column) {
        newStage = column.id;
      } else {
        console.log('Drop target is not a valid stage');
        return;
      }
    }

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) {
      console.log('No candidate found or stage unchanged');
      return;
    }

    // Optimistic update
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
    );
    console.log(`Moving candidate ${candidateId} from ${candidate.stage} to ${newStage}`);

    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ stage: newStage, author: user.name })
      });

      if (!response.ok) {
        // Rollback on error
        setCandidates(prev =>
          prev.map(c =>
            c.id === candidateId ? { ...c, stage: candidate.stage } : c
          )
        );
        console.log('PATCH failed, rolling back');
      } else {
        addNotification({
          message: `${user.name} moved ${candidate.name} from ${candidate.stage} to ${newStage}`,
          time: new Date().toLocaleTimeString()
        });
        console.log('PATCH succeeded');
      }
    } catch (error) {
      // Rollback on error
      setCandidates(prev =>
        prev.map(c =>
          c.id === candidateId ? { ...c, stage: candidate.stage } : c
        )
      );
      console.error('Failed to update candidate stage:', error);
    }
  };

  const getCandidatesByStage = (stage: CandidateStage) => {
    return candidates.filter(candidate => candidate.stage === stage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidate Pipeline</h1>
        <p className="text-gray-600 dark:text-gray-400">Drag and drop candidates between stages</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={isReadOnly ? undefined : handleDragStart}
        onDragEnd={isReadOnly ? undefined : handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 min-h-[600px]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              candidates={getCandidatesByStage(column.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;