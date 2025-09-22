import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { round2Api, Round2Question } from '../api';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black" style={{ fontFamily: 'Patrick Hand, cursive' }}>Loading Round 2 questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 
          className="text-6xl font-bold text-black mb-8 text-center"
          style={{ fontFamily: 'Patrick Hand, cursive' }}
        >
          🌟 Round 2 Challenges
        </h1>

        <div className="grid gap-6">
          {questions.map((question) => (
            <div
              key={question._id}
              className="bg-white rounded-xl border-2 border-black p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col space-y-4">
                <div className="prose max-w-none">
                  <p 
                    className="text-lg text-gray-800 whitespace-pre-line"
                    style={{ fontFamily: 'Patrick Hand, cursive' }}
                  >
                    {question.description}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(`/submit/${question._id}`)}
                  className="w-full py-3 px-4 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
                  style={{ fontFamily: 'Patrick Hand, cursive' }}
                >
                  Submit Solution 🚀
                </button>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center p-8 border-2 border-gray-200 rounded-xl">
              <p 
                className="text-xl text-gray-600"
                style={{ fontFamily: 'Patrick Hand, cursive' }}
              >
                No Round 2 questions available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}