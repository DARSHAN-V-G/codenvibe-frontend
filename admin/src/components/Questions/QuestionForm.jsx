import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function QuestionForm({ question, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: 1,
    correct_code: '',
    incorrect_code: '',
    test_cases: [{ input: '', expectedOutput: '' }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        description: question.description || '',
        year: question.year || 1,
        correct_code: question.correct_code || '',
        incorrect_code: question.incorrect_code || '',
        test_cases: question.test_cases && question.test_cases.length > 0 
          ? question.test_cases 
          : [{ input: '', expectedOutput: '' }],
      });
    }
  }, [question]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      test_cases: prev.test_cases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      test_cases: [...prev.test_cases, { input: '', expectedOutput: '' }],
    }));
  };

  const removeTestCase = (index) => {
    if (formData.test_cases.length > 1) {
      setFormData(prev => ({
        ...prev,
        test_cases: prev.test_cases.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.correct_code.trim()) {
      setError('Correct code is required');
      return;
    }
    if (!formData.incorrect_code.trim()) {
      setError('Incorrect code is required');
      return;
    }
    if (formData.test_cases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim())) {
      setError('All test cases must have both input and expected output');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {question ? 'Edit Question' : 'Add New Question'}
            </h1>
            <p className="text-gray-600 mt-2">
              {question ? 'Update the question details below' : 'Create a new coding question'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Details</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter question title..."
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter question description..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>

            <div>
              <label htmlFor="correct_code" className="block text-sm font-medium text-gray-700 mb-2">
                Correct Code
              </label>
              <textarea
                id="correct_code"
                rows={8}
                value={formData.correct_code}
                onChange={(e) => handleInputChange('correct_code', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter the correct solution code..."
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="incorrect_code" className="block text-sm font-medium text-gray-700 mb-2">
                Incorrect Code
              </label>
              <textarea
                id="incorrect_code"
                rows={8}
                value={formData.incorrect_code}
                onChange={(e) => handleInputChange('incorrect_code', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter the incorrect/buggy code..."
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Cases</h2>
            <button
              type="button"
              onClick={addTestCase}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span>Add Test Case</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.test_cases.map((testCase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">Test Case {index + 1}</h3>
                  {formData.test_cases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Input
                    </label>
                    <textarea
                      rows={3}
                      value={testCase.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Test input..."
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expected Output
                    </label>
                    <textarea
                      rows={3}
                      value={testCase.expectedOutput}
                      onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Expected output..."
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Question'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}