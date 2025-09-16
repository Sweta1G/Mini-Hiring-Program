import { useUser } from '../../contexts/UserContext';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Eye, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Assessment, AssessmentSection, AssessmentQuestion } from '../../types';
import QuestionBuilder from './QuestionBuilder';
import AssessmentPreview from './AssessmentPreview';

const AssessmentBuilder: React.FC = () => {
  const { user } = useUser();
  const isReadOnly = user.role === 'readonly';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const jobId = location.state?.jobId;
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssessment();
    }
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${id}`);
      const data = await response.json();
      if (data.data) {
        setAssessment(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
    }
  };

  const handleSave = async () => {
    if (isReadOnly || !assessment) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      });
      if (response.ok) {
        const data = await response.json();
        setAssessment(data.data);
        if (from === 'jobs' && jobId) {
          navigate(`/jobs?highlight=${jobId}`);
        } else {
          navigate('/assessments');
        }
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    if (isReadOnly || !assessment) return;
    const newSection: AssessmentSection = {
      id: Date.now().toString(),
      title: 'New Section',
      questions: [],
      order: assessment.sections.length + 1
    };
    setAssessment(prev => prev ? { ...prev, sections: [...prev.sections, newSection] } : prev);
  };

  const updateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    if (isReadOnly) return;
    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    } : prev);
  };

  const deleteSection = (sectionId: string) => {
    if (isReadOnly) return;
    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    } : prev);
  };

  const addQuestion = (sectionId: string) => {
    if (isReadOnly || !assessment) return;
    const newQuestion: AssessmentQuestion = {
      id: Date.now().toString(),
      type: 'short-text',
      question: 'New Question',
      required: false,
      order: 1
    };
    const section = assessment.sections.find(s => s.id === sectionId);
    updateSection(sectionId, {
      questions: [
        ...(section?.questions || []),
        newQuestion
      ]
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
    if (isReadOnly || !assessment) return;
    const section = assessment.sections.find(s => s.id === sectionId);
    if (!section) return;
    const updatedQuestions = section.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateSection(sectionId, { questions: updatedQuestions });
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    if (isReadOnly || !assessment) return;
    const section = assessment.sections.find(s => s.id === sectionId);
    if (!section) return;
    const updatedQuestions = section.questions.filter(q => q.id !== questionId);
    updateSection(sectionId, { questions: updatedQuestions });
  };


  if (!assessment) {
    return <div>Loading...</div>;
  }

  if (showPreview) {
    return (
      <AssessmentPreview
        assessment={assessment}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => {
              if (from === 'jobs' && jobId) {
                navigate(`/jobs?highlight=${jobId}`);
              } else {
                navigate('/assessments');
              }
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assessment Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create assessments for job candidates
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assessment Title
              </label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => setAssessment(prev => prev ? { ...prev, title: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter assessment title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={assessment.description}
                onChange={(e) => setAssessment(prev => prev ? { ...prev, description: e.target.value } : prev)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter assessment description..."
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {assessment.sections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="text-lg font-semibold bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addQuestion(section.id)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Question
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <QuestionBuilder
                      key={question.id}
                      question={question}
                      onUpdate={(updates) => updateQuestion(section.id, question.id, updates)}
                      onDelete={() => deleteQuestion(section.id, question.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={addSection}
              className="w-full flex items-center justify-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilder;