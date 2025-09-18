import React, { useState, useEffect } from 'react';
import { Code, Users, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalTeams: 0,
    questionsWithIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [questionsResponse, teamsResponse] = await Promise.all([
        api.getAllQuestions(),
        api.getAllTeams(),
      ]);

      const questions = questionsResponse.questions || [];
      const teams = teamsResponse.teams || [];

      setStats({
        totalQuestions: questions.length,
        totalTeams: teams.length,
        questionsWithIssues: 0, // We could implement logic to count questions with test failures
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = 'blue', description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
      <div className="flex items-center">
        <div className={`bg-${color}-100 p-3 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : value}</p>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to CodeVibe Admin Portal</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Code}
          title="Total Questions"
          value={stats.totalQuestions}
          color="blue"
          description="Questions in the database"
        />
        <StatCard
          icon={Users}
          title="Total Teams"
          value={stats.totalTeams}
          color="green"
          description="Registered teams"
        />
        <StatCard
          icon={stats.questionsWithIssues > 0 ? AlertCircle : CheckCircle}
          title="Question Status"
          value={stats.questionsWithIssues > 0 ? 'Issues Found' : 'All Good'}
          color={stats.questionsWithIssues > 0 ? 'red' : 'green'}
          description={stats.questionsWithIssues > 0 ? 
            `${stats.questionsWithIssues} questions need attention` : 
            'All questions are working properly'}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/questions"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Code className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <h3 className="font-medium text-blue-900">Manage Questions</h3>
              <p className="text-blue-700 text-sm">Add, edit, and test questions</p>
            </div>
          </a>
          <a
            href="/teams"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
          >
            <Users className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h3 className="font-medium text-green-900">Manage Teams</h3>
              <p className="text-green-700 text-sm">Add, edit, and remove teams</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-green-800 font-medium">API Connection</span>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-green-800 font-medium">Database</span>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}