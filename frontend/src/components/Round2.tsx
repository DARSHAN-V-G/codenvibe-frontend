import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { round2Api, Round2Question } from '../api';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Navigation } from './Navigation';
import toast from 'react-hot-toast';

export function Round2() {
  const [questions, setQuestions] = useState<Round2Question[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await round2Api.getQuestions();
        if (data.success) {
          setQuestions(data.questions);
        } else {
          toast.error('Failed to load Round 2 questions');
        }
      } catch (error) {
        toast.error('Error loading Round 2 questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black font-main">Loading Round 2 questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navigation
        currentPage="questions"
        onNavigate={(page) => navigate(`/${page}`)}
        isLoggedIn={true}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 pointer-events-none" />
      <div className="relative p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-black mb-4 font-main tracking-tight">
              Round 2 Challenges
            </h1>
            <p className="text-xl text-gray-600 font-main mb-8">
              Show your skills and climb the leaderboard!
            </p>
            <div className="max-w-xl mx-auto mb-12">
              <Progress value={60} className="h-2" />
              <p className="text-sm text-gray-500 mt-2 font-main">Round 2 progress: 60%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className="bg-white rounded-xl border-2 border-black p-6 shadow-lg hover:shadow-xl transition-shadow relative"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-black mb-2 font-main">
                    Challenge {index + 1}
                  </h3>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed font-main line-clamp-3">
                  {question.description}
                </p>

                <Button
                  onClick={() => navigate(`/submit/${question._id}`)}
                  className="w-full py-3 px-6 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-main"
                >
                  Submit Solution
                </Button>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <div className="bg-white p-8 rounded-xl border-2 border-black shadow-lg max-w-md mx-auto">
                  <h3 className="text-2xl font-bold mb-2 font-main">No challenges available</h3>
                  <p className="text-gray-600 font-main">
                    Check back later for Round 2 challenges.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}