import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Assessment, AssessmentQuestion } from '../../types';

interface AssessmentPreviewProps {
  assessment: Assessment;
  onClose: () => void;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({ assessment, onClose }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const validateQuestion = (question: AssessmentQuestion, value: any): string => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (question.validation) {
      const { maxLength, minValue, maxValue } = question.validation;
      
      if (maxLength && typeof value === 'string' && value.length > maxLength) {
        return `Maximum ${maxLength} characters allowed`;
      }
      
      if (typeof value === 'number') {
        if (minValue !== undefined && value < minValue) {
          return `Value must be at least ${minValue}`;
        }
        if (maxValue !== undefined && value > maxValue) {
          return `Value must be at most ${maxValue}`;
        }
      }
    }

    return '';
  };

  const shouldShowQuestion = (question: AssessmentQuestion): boolean => {
    if (!question.conditionalLogic) return true;

    const { dependsOn, showIf } = question.conditionalLogic;
    const dependentValue = responses[dependsOn];

    if (Array.isArray(showIf)) {
      return showIf.includes(dependentValue);
    }
    
    return dependentValue === showIf;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (shouldShowQuestion(question)) {
          const error = validateQuestion(question, responses[question.id]);
          if (error) {
            newErrors[question.id] = error;
          }
        }
      });
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      // In a real app, you would submit the responses to your API
      console.log('Submitted responses:', responses);
    }
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    if (!shouldShowQuestion(question)) {
      return null;
    }

    const value = responses[question.id] || '';
    const error = errors[question.id];

    return (
      <div key={question.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Single Choice */}
        {question.type === 'single-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Multiple Choice */}
        {question.type === 'multi-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short Text */}
        {question.type === 'short-text' && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            maxLength={question.validation?.maxLength}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your answer..."
          />
        )}

        {/* Long Text */}
        {question.type === 'long-text' && (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            maxLength={question.validation?.maxLength}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your answer..."
          />
        )}

        {/* Numeric */}
        {question.type === 'numeric' && (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(question.id, parseFloat(e.target.value) || '')}
            min={question.validation?.minValue}
            max={question.validation?.maxValue}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter a number..."
          />
        )}

        {/* File Upload */}
        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <label className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                  Click to upload
                  <input type="file" className="sr-only" />
                </label>
                <span> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}

        {question.validation?.maxLength && (question.type === 'short-text' || question.type === 'long-text') && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {value.length || 0} / {question.validation.maxLength} characters
          </p>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Assessment Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your responses have been recorded successfully.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {assessment.title || 'Assessment Preview'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {assessment.description || 'This is how candidates will see the assessment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-8">
              {assessment.sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-6">
                    {section.questions.map(renderQuestion)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Assessment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPreview;