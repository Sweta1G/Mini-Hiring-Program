import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ExternalLink, Tag, UserCheck } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateCardProps {
  candidate: Candidate;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const getStageColor = (stage: string) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      screen: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      tech: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      offer: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      hired: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[stage as keyof typeof colors] || colors.applied;
  };

  // Map stage value to label
  const stageLabels: Record<string, string> = {
    applied: 'Applied',
    screen: 'Screening',
    tech: 'Technical',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected',
  };
  const stageLabel = stageLabels[candidate.stage] || 'Applied';

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {candidate.name}
              </h3>
              {candidate.referred && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Referred
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStageColor(candidate.stage)}`}>
                {stageLabel}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {candidate.email}
              </div>
              {candidate.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {candidate.phone}
                </div>
              )}
            </div>
            
            {candidate.referredBy && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Referred by: {candidate.referredBy}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/candidates/${candidate.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;