import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, MessageSquare, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Candidate, CandidateTimelineEvent } from '../../types';

const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<CandidateTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCandidateData(id);
    }
  }, [id]);

  const fetchCandidateData = async (candidateId: string) => {
    try {
      // In a real app, you'd fetch from your API
      // For now, we'll simulate getting data from local storage
      const response = await fetch(`/api/candidates?pageSize=1000`);
      const data = await response.json();
      const candidateData = data.data.find((c: Candidate) => c.id === candidateId);
      
      if (candidateData) {
        setCandidate(candidateData);
        
        // Fetch timeline
        const timelineResponse = await fetch(`/api/candidates/${candidateId}/timeline`);
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Candidate not found
        </h2>
        <Link to="/candidates" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/candidates"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {candidate.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Candidate Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {candidate.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStageColor(candidate.stage)}`}>
                    {candidate.stage}
                  </span>
                  {candidate.referred && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Referred
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-3" />
                <span className="text-sm">{candidate.email}</span>
              </div>
              
              {candidate.phone && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-3" />
                  <span className="text-sm">{candidate.phone}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-3" />
                <span className="text-sm">Applied {formatDate(candidate.createdAt)}</span>
              </div>

              {candidate.referredBy && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-2">
                    Referral Information
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Referred by: {candidate.referredBy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Timeline
              </h3>
            </div>

            <div className="space-y-4">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.type === 'stage_change' && (
                            <>
                              Moved from <span className="text-blue-600 dark:text-blue-400">{event.previousStage}</span> to{' '}
                              <span className="text-green-600 dark:text-green-400">{event.newStage}</span>
                            </>
                          )}
                          {event.type === 'note_added' && 'Added note'}
                          {event.type === 'applied' && 'Applied for position'}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        by HR: {event.author}
                      </p>
                      {event.note && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;