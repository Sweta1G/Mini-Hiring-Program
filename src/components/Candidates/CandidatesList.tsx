import React, { useState, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import { Search, Filter, UserPlus } from 'lucide-react';
import { Candidate, CandidateStage } from '../../types';
import CandidateCard from './CandidateCard';

const CandidatesList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'all'>('all');

  const stages: { value: CandidateStage | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All Stages', color: 'gray' },
    { value: 'applied', label: 'Applied', color: 'blue' },
    { value: 'screen', label: 'Screening', color: 'yellow' },
    { value: 'tech', label: 'Technical', color: 'purple' },
    { value: 'offer', label: 'Offer', color: 'green' },
    { value: 'hired', label: 'Hired', color: 'emerald' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ];

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '1000', // Load all for virtualization
      });

      const response = await fetch(`/api/candidates?${params}`);
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

  useEffect(() => {
    let filtered = candidates;

    // Client-side search
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.stage === stageFilter);
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, stageFilter]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const candidate = filteredCandidates[index];
    if (!candidate) return null;

    return (
      <div style={style}>
        <CandidateCard candidate={candidate} />
      </div>
    );
  };

  const stageCounts = stages.map(stage => ({
    ...stage,
    count: stage.value === 'all' 
      ? candidates.length 
      : candidates.filter(c => c.stage === stage.value).length
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidates</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage candidate applications and progress</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Candidate
        </button>
      </div>

      {/* Stage Pills */}
      <div className="flex flex-wrap gap-2">
        {stageCounts.map((stage) => (
          <button
            key={stage.value}
            onClick={() => setStageFilter(stage.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              stageFilter === stage.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {stage.label} ({stage.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Virtualized List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <FixedSizeList
            height={600}
            width={"100%"}
            itemCount={filteredCandidates.length}
            itemSize={120}
            className="candidate-list"
          >
            {Row}
          </FixedSizeList>
          
          {filteredCandidates.length === 0 && !loading && (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 dark:text-gray-400">No candidates found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidatesList;