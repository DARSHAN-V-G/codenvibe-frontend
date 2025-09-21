import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { questionApi } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface QuestionListPageProps {
  onSelectQuestion: (questionId: string) => void;
}

export function QuestionListPage({ onSelectQuestion }: QuestionListPageProps) {

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const questionsData = await questionApi.getQuestions();
      const questionsWithDefaults = questionsData.map(q => ({
        ...q,
        completed: false
      }));
      setQuestions(questionsWithDefaults);
      console.log(`Loaded ${questionsData.length} questions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchQuestions();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div style={styles.centered}>
        <p style={styles.loadingText}>Loading questions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.centered}>
        <p style={styles.loadingText}>Please log in to view questions.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <div style={styles.errorBox}>
          <h1 style={styles.errorTitle}>Error Loading Questions</h1>
          <p style={styles.errorText}>{error}</p>
          <Button onClick={fetchQuestions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black mb-4 font-main">
            Debugging Challenges
          </h1>
          <p className="text-xl text-gray-600 font-main">
            Choose a challenge and start debugging!
          </p>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((question) => (
            <div
              key={question._id}
              className="bg-white rounded-xl border-2 border-black p-6 shadow-lg hover:shadow-xl transition-shadow relative"
            >
              {question.completed && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-2xl font-bold text-black mb-2 font-main">
                  {question.title}
                </h3>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed font-main">
                {question.description}
              </p>

              <Button
                onClick={() => onSelectQuestion(question._id)}
                className="w-full py-3 px-6 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-main"
              >
                {question.completed ? 'View Solution' : 'Start Challenge'}
              </Button>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-xl border-2 border-black shadow-lg max-w-md mx-auto">
              <h3 className="text-2xl font-bold mb-2 font-main">No challenges available</h3>
              <p className="text-gray-600 font-main">
                Check back later for new debugging challenges.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  centered: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#444',
    fontSize: '1.1rem',
  },
  errorBox: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#222',
  },
  errorText: {
    color: '#666',
    marginBottom: '1rem',
  },
};
