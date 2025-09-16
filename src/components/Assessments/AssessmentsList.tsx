import React, { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { db, initializeDatabase } from '../../lib/db';

interface AssessmentCardProps {
  title: string;
  jobTitle: string;
  questionCount: number;
  description?: string;
}

interface AssessmentCardClickableProps extends AssessmentCardProps {
  jobSubtitle?: string;
  jobTags?: string[];
  onReset?: () => void;
  onPreview?: () => void;
}

interface AssessmentCardWithDeleteProps extends AssessmentCardClickableProps {
  onDelete?: () => void;
  showDelete?: boolean;
}

const AssessmentCard: React.FC<AssessmentCardWithDeleteProps> = ({
  title,
  jobTitle,
  jobSubtitle,
  jobTags,
  questionCount,
  description,
  onReset,
  onPreview,
  onDelete,
  showDelete
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col min-h-[260px] relative">
    {/* Delete icon */}
    {showDelete && (
      <button
        className="absolute top-3 right-3 text-red-600 hover:text-red-800"
        title="Delete Assessment"
        onClick={onDelete}
      >
        <XCircle className="w-5 h-5" />
      </button>
    )}
    {/* Top: Job title, subtitle, tags */}
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">{jobTitle}</span>
        {jobTags && jobTags.map((tag, i) => (
          <span key={i} className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">{tag}</span>
        ))}
      </div>
      {jobSubtitle && <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{jobSubtitle}</div>}
      {/* Green info box */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 flex flex-col gap-1 border border-green-200 dark:border-green-700">
        <span className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
          <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" /></svg>
          Assessment Created
        </span>
        <span className="font-bold text-gray-900 dark:text-white text-base">{title}</span>
        <span className="text-sm text-gray-700 dark:text-gray-300">{description}</span>
      </div>
      {/* Icons row */}
      <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
          {questionCount} questions
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
          less than a minute ago
        </span>
      </div>
    </div>
    {/* Buttons */}
    <div className="flex gap-2 mt-2">
      <button
        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
        onClick={onReset}
      >
        <span className="inline-block align-middle mr-1">♻️</span> Reset
      </button>
      <button
        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-blue-700 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-semibold"
        onClick={onPreview}
      >
        <span className="inline-block align-middle mr-1">👁️</span> Preview
      </button>
    </div>
  </div>
);


const AssessmentsList: React.FC = () => {
  useEffect(() => {
    // Fetch all assessments
    const fetchAssessments = async () => {
      try {
        const res = await fetch('/api/assessments');
        const data = await res.json();
        setAssessments(data.data || []);
      } catch (err) {
        setAssessments([]);
      }
    };
    // Fetch all jobs for mapping job info
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        // Map jobs by id for fast lookup
  const jobsById: Record<string, any> = {};
        (data.data || []).forEach((job: any) => {
          jobsById[job.id] = job;
        });
        setJobs(jobsById);
      } catch (err) {
        setJobs({});
      }
    };
    fetchAssessments();
    fetchJobs();
  }, []);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any>({});
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { user } = useUser();
  const isReadOnly = user.role === 'readonly';

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessments</h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50"
              onClick={async () => {
                if (isReadOnly) return;
                const res = await fetch('/api/assessments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: 'Untitled Assessment',
                    description: '',
                    jobId: '',
                    sections: [],
                  })
                });
                const data = await res.json();
                if (data.data && data.data.id) {
                  navigate(`/assessments/${data.data.id}`, { state: { from: 'assessments' } });
                }
              }}
              disabled={isReadOnly}
            >
              + Add Assessment
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assess, idx) => {
            const job = jobs[assess.jobId];
            const handleResetAssessment = async () => {
              if (isReadOnly) return;
              await db.assessments.update(assess.id, {
                title: 'Untitled Assessment',
                description: '',
                sections: [],
                updatedAt: new Date()
              });
              setAssessments(prev => prev.map(a =>
                a.id === assess.id
                  ? { ...a, title: 'Untitled Assessment', description: '', sections: [], updatedAt: new Date() }
                  : a
              ));
              addNotification({
                message: `${user.name} reset assessment "${assess.title}"`,
                time: new Date().toLocaleTimeString()
              });
            };
            const handleDelete = async () => {
              if (isReadOnly) return;
              if (!window.confirm('Are you sure you want to delete this assessment?')) return;
              await fetch(`/api/assessments/${assess.id}`, { method: 'DELETE' });
              setAssessments(prev => prev.filter(a => a.id !== assess.id));
              addNotification({
                message: `${user.name} deleted assessment "${assess.title}"`,
                time: new Date().toLocaleTimeString()
              });
            };
            return (
              <AssessmentCard
                key={assess.id}
                title={assess.title}
                jobTitle={job?.title || 'Unknown'}
                jobSubtitle={job ? `${job.department || job.tags?.[0] || ''} • ${job.location || ''}` : ''}
                jobTags={job?.tags}
                questionCount={assess.sections?.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0) || 0}
                description={assess.description}
                onReset={isReadOnly ? undefined : handleResetAssessment}
                onPreview={() => navigate(`/assessments/${assess.id}`, { state: { from: 'assessments' } })}
                onDelete={isReadOnly ? undefined : handleDelete}
                showDelete={!['1','2','3'].includes(assess.id) && !isReadOnly}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default AssessmentsList;
