import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Code } from 'lucide-react';
import api from '../../utils/api.ts';
import QuestionForm from './QuestionForm';

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await api.getAllQuestions();
      setQuestions(response.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.removeQuestion(id);
      await loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question: ' + error.message);
    }
  };

  const handleFormSubmit = async (questionData) => {
    try {
      if (editingQuestion) {
        await api.updateQuestion(editingQuestion._id, questionData);
      } else {
        await api.addQuestion(questionData);
      }
      await loadQuestions();
      setShowForm(false);
      setEditingQuestion(null);
    } catch (error) {
      throw error;
    }
  };

  if (showForm) {
    return (
      <QuestionForm
        question={editingQuestion}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingQuestion(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
          <p className="text-gray-600 mt-2">Manage coding questions and test cases</p>
        </div>
        <button
          onClick={handleAddQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Question</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-600">Create your first question to get started</p>
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, onEdit, onDelete }) {
  const [checkingQuestion, setCheckingQuestion] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const handleCheck = async () => {
    try {
      setCheckingQuestion(true);
      setCheckResult(null);
      const result = await api.checkQuestion(question._id);
      setCheckResult(result);
    } catch (error) {
      console.error('Error checking question:', error);
      setCheckResult({
        success: false,
        message: error.message || 'Failed to check question'
      });
    } finally {
      setCheckingQuestion(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{question.title || 'Untitled Question'}</h3>
          <p className="text-gray-600 mt-1">Year {question.year}</p>
          <p className="text-gray-600 mt-2">
            {question.description || 'No description available'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(question)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit question"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Test Cases
          </h4>
          <div className="text-sm text-gray-600">
            {question.test_cases?.length || 0} test case{(question.test_cases?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>

        {checkResult && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div className={`p-4 ${
              checkResult.passed === checkResult.total
                ? 'bg-green-50 border-b border-green-200'
                : 'bg-yellow-50 border-b border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Test Results
                </h4>
                <div className="text-sm">
                  Passed: <span className="font-medium">{checkResult.passed}/{checkResult.total}</span>
                </div>
              </div>
            </div>
            
            <div className="divide-y">
              {checkResult.results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 ${
                    result.passed 
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Test Case {index + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.passed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Input:</div>
                      <pre className="font-mono bg-white p-2 rounded border">
                        {result.input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Expected:</div>
                      <pre className="font-mono bg-white p-2 rounded border">
                        {result.expectedOutput}
                      </pre>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Actual:</div>
                      <pre className="font-mono bg-white p-2 rounded border">
                        {result.actualOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleCheck}
            disabled={checkingQuestion}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingQuestion ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Code className="w-4 h-4" />
                <span>Check Question</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}