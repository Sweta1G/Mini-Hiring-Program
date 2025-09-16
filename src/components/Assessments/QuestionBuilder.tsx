import React from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { AssessmentQuestion } from '../../types';

interface QuestionBuilderProps {
  question: AssessmentQuestion;
  onUpdate: (updates: Partial<AssessmentQuestion>) => void;
  onDelete: () => void;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ question, onUpdate, onDelete }) => {
  const questionTypes = [
    { value: 'single-choice', label: 'Single Choice' },
    { value: 'multi-choice', label: 'Multiple Choice' },
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'file-upload', label: 'File Upload' }
  ];

  const addOption = () => {
    const newOptions = [...(question.options || []), 'New Option'];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: newOptions });
  };

  const needsOptions = question.type === 'single-choice' || question.type === 'multi-choice';

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question
              </label>
              <textarea
                rows={2}
                value={question.question}
                onChange={(e) => onUpdate({ question: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your question..."
              />
            </div>
            
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">Required</span>
            </label>

            {(question.type === 'short-text' || question.type === 'long-text') && (
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-700 dark:text-gray-300">Max Length:</label>
                <input
                  type="number"
                  value={question.validation?.maxLength || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { 
                      ...question.validation, 
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                    } 
                  })}
                  className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="100"
                />
              </div>
            )}

            {question.type === 'numeric' && (
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-700 dark:text-gray-300">Range:</label>
                <input
                  type="number"
                  value={question.validation?.minValue || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { 
                      ...question.validation, 
                      minValue: e.target.value ? parseInt(e.target.value) : undefined 
                    } 
                  })}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="0"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="number"
                  value={question.validation?.maxValue || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { 
                      ...question.validation, 
                      maxValue: e.target.value ? parseInt(e.target.value) : undefined 
                    } 
                  })}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="100"
                />
              </div>
            )}
          </div>

          {needsOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="ml-4 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuestionBuilder;