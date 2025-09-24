import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

export function Rules() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-6xl font-bold text-black mb-4"
            style={{ fontFamily: 'Patrick Hand, cursive' }}
          >
          Game Rules
          </h1>
          <p 
            className="text-xl text-gray-600"
            style={{ fontFamily: 'Patrick Hand, cursive' }}
          >
            Master the art of debugging and climb the leaderboard!
          </p>
        </div>

        {/* Rules Content */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl border-2 border-black p-8 shadow-lg">
            <h2 
              className="text-3xl font-bold mb-6"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              How Scoring Works
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-blue-600">
                  Objective
                </h3>
                <p className="text-lg text-gray-700">
                  Debug each challenge to perfection! Your score depends on your efficiency and accuracy in fixing the code.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-green-600">
                  Score Calculation
                </h3>
                <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
                  <li>Each successful debug adds to your score</li>
                  <li>Syntax errors reduce your potential points</li>
                  <li>Wrong submissions impact your final score</li>
                  <li>Faster solutions earn bonus points</li>
                  <li>Time efficiency is key to maximizing your score</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-purple-600">
                  Pro Tips
                </h3>
                <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
                  <li>Test your solution thoroughly before submitting</li>
                  <li>Focus on fixing one error at a time</li>
                  <li>Review the test cases carefully</li>
                  <li>Time management is crucial</li>
                  <li>Learn from each wrong submission</li>
                </ul>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-lg text-yellow-800">
                  <strong>Remember:</strong> The goal is not just to fix the code, but to do it efficiently with minimal errors. 
                  Each challenge is an opportunity to improve your debugging skills and climb the leaderboard!
                </p>
              </div>

              {/* Start Coding Button */}
              <div className="mt-12 text-center">
              <Button
                onClick={() => navigate('/questions')}
                className="p-6 text-xl border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
                style={{ fontFamily: 'Patrick Hand, cursive' }}
              >
                Start Coding Now!
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}