import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { questionApi, QuestionListItem, debugCookieTransmission } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface QuestionListPageProps {
  onSelectQuestion: (questionId: string) => void;
}

export function QuestionListPage({ onSelectQuestion }: QuestionListPageProps) {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { team, isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📚 QuestionListPage: Fetching questions from backend...');
      const questionsData = await questionApi.getQuestions();
      console.log('📚 QuestionListPage: Successfully fetched questions:', questionsData);
      setQuestions(questionsData);
      if (questionsData.length === 0) {
        toast('No questions available at the moment', {
          icon: '📭',
          duration: 3000,
        });
      } else {
        toast.success(`Loaded ${questionsData.length} questions`, {
          duration: 2000,
        });
      }
    } catch (err) {
      console.error('❌ QuestionListPage: Error fetching questions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch questions after auth check is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      console.log('🔍 QuestionListPage: Auth check complete and user authenticated, fetching questions...');
      fetchQuestions();
    } else if (!authLoading && !isAuthenticated) {
      console.log('🔍 QuestionListPage: Auth check complete but user not authenticated');
      setIsLoading(false);
    } else {
      console.log('🔍 QuestionListPage: Waiting for auth check to complete...');
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg">
            {authLoading ? 'Checking authentication...' : 'Loading questions...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect will be handled by App.tsx/ProtectedRoute
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Please log in to view questions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Questions</h1>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
          <Button
            onClick={fetchQuestions}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <h1
              className="text-5xl font-bold text-black mr-4"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Debugging Challenges
            </h1>
            <Button
              onClick={fetchQuestions}
              disabled={isLoading}
              className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh questions"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </Button>
            <Button
              onClick={async () => {
                const result = await debugCookieTransmission();
                if (result.success) {
                  toast.success('Cookie transmission test passed!', { duration: 3000 });
                } else {
                  toast.error('Cookie transmission test failed - check console', { duration: 5000 });
                }
              }}
              className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              title="Debug cookie transmission"
            >
              🧪 Debug
            </Button>
          </div>

          {team && (
            <p className="text-2xl text-gray-700 mb-6 font-medium">
              Welcome, {team.team_name}!
            </p>
          )}

          <p className="text-gray-600 mb-4">
            Total Questions: {questions.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-xl p-8 shadow-md 
                hover:shadow-xl hover:-translate-y-2 
                transition-all duration-300 group
                border border-gray-200 relative overflow-hidden"
              onClick={() => onSelectQuestion(question._id)}
            >
              {/* Decorative element */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>

              {/* Question number and ID badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                  #{index + 1}
                </div>
                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-mono">
                  {question._id.slice(-6)}
                </div>
              </div>

              {/* Question Header */}
              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-4">
                  {question?.title || `Challenge ${index + 1}`}
                </h3>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
                <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                  {question?.description || "Click to start debugging this challenge"}
                </p>
              </div>

              {/* Action Button - Sliding background hover effect */}
              <Button
                aria-label="Start"
                className="w-full relative h-14 overflow-hidden rounded-lg border-2 border-blue-500 
                bg-transparent px-8 font-bold text-blue-600 text-lg tracking-wide
                before:absolute before:bottom-0 cursor-pointer before:left-0 before:block before:h-full before:w-full 
                before:-translate-x-full hover:bg-whitesmoke before:bg-blue-500 before:transition-transform before:duration-300
                hover:before:translate-x-0 hover:text-white transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ fontFamily: 'Patrick Hand, cursive' }}
                onClick={() => onSelectQuestion(question._id)}
              >
                <span className="relative z-10">Start Challenge</span>
                <svg
                  className="relative z-10 ml-2 w-6 h-6 group-hover:translate-x-5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          ))}
        </div>

        {questions?.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl p-8 shadow-md max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No challenges available</h3>
              <p className="text-gray-600">Check back later for new debugging challenges.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}