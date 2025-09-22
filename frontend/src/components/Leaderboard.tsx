import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import "./Leaderboard.css";

export default function Leaderboard() {
  const [error, setError] = useState<string | null>(null);
  const { team, isAuthenticated } = useAuth();
  const { isConnected, lastUpdate, leaderboardData } = useWebSocket();

  // Get current user's team data for highlighting
  const currentTeamName = team?.team_name;

  const getMedal = (rank: number | undefined): string | number => {
    if (!rank) return "-";
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  // Handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };



  if (!isAuthenticated) {
    return (
      <div className="leaderboard-container">
        <div className="title-container">
          <h1 className="title">🏆 Leaderboard</h1>
        </div>
        <p className="caption">Please log in to view the leaderboard</p>
      </div>
    );
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="leaderboard-container">
        <div className="title-container">
          <h1 className="title">🏆 Leaderboard</h1>
        </div>
        <p className="caption">Loading leaderboard...</p>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #333',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="title-container">
          <h1 className="title">🏆 Leaderboard</h1>
        </div>
        <p className="caption" style={{ color: '#ef4444' }}>Error: {error}</p>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <button 
            onClick={handleRefresh}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Title with Trophy */}
      <div className="title-container">
        <h1 className="title">🏆 Leaderboard</h1>
      </div>
      <p className="caption">
        Top debuggers in the competition
        {team?.year && ` (Year ${team.year})`}
      </p>

      {/* Status and Last Updated */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
        <span style={{ 
          display: 'inline-block', 
          marginRight: '1rem',
          color: isConnected ? '#10b981' : '#ef4444'
        }}>
          {isConnected ? '🟢 Live Updates' : '🔴 Disconnected'}
        </span>
        {lastUpdate && <span>Last updated: {lastUpdate}</span>}
        <button 
          onClick={handleRefresh}
          style={{
            marginLeft: '1rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {leaderboardData.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No teams found in the leaderboard yet.
        </p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Score</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr 
                key={entry._id} 
                className={`${index < 3 ? "highlight" : ""} ${
                  entry.team_name === currentTeamName ? "current-team" : ""
                }`}
                style={entry.team_name === currentTeamName ? {
                  backgroundColor: '#dbeafe',
                  border: '2px solid #3b82f6'
                } : {}}
              >
                <td>{getMedal(entry.rank)}</td>
                <td>
                  {entry.team_name}
                  {entry.team_name === currentTeamName && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#3b82f6' }}>
                      (You)
                    </span>
                  )}
                </td>
                <td className="score">{entry.score}</td>
                <td>
                  <span className="solved-pill">{entry.solved}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
