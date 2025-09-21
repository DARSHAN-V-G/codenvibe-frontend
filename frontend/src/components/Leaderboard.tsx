import { useState, useEffect, useRef } from 'react';
import { leaderboardApi, setupWebSocket, LeaderboardEntry } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import "./Leaderboard.css";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const { team, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  // Get current user's team data for highlighting
  const currentTeamName = team?.team_name;

  const getMedal = (rank: number): string | number => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  // Fetch initial leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (team?.year) {
        response = await leaderboardApi.getLeaderboardByYear(team.year);
      } else {
        response = await leaderboardApi.getLeaderboard();
      }
      
      setLeaderboardData(response.leaderboard);
      setLastUpdated(new Date(response.timestamp).toLocaleTimeString());
      console.log('✅ Leaderboard loaded:', response.leaderboard.length, 'teams');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(errorMessage);
      console.error('❌ Leaderboard fetch failed:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle WebSocket score updates
  const handleScoreUpdate = (data: any) => {
    console.log('📊 WebSocket leaderboard update received:', data);
    
    try {
      // Update leaderboard data if it's a leaderboard update
      if (data.type === 'leaderboard_update' && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Show notification for score updates
        if (data.updated_team && currentTeamName === data.updated_team) {
          toast.success(`Your team's score has been updated!`);
        }
      }
      // Handle individual score updates
      else if (data.type === 'score_update' && data.team_name && data.new_score) {
        setLeaderboardData(prev => 
          prev.map(entry => 
            entry.team_name === data.team_name 
              ? { ...entry, score: data.new_score, solved: data.solved || entry.solved }
              : entry
          ).sort((a, b) => b.score - a.score) // Re-sort by score
           .map((entry, index) => ({ ...entry, rank: index + 1 })) // Update ranks
        );
        setLastUpdated(new Date().toLocaleTimeString());
        
        if (currentTeamName === data.team_name) {
          toast.success(`Score updated: ${data.new_score} points!`);
        }
      }
    } catch (err) {
      console.error('❌ Error processing WebSocket update:', err);
    }
  };

  // Setup WebSocket connection
  const setupWebSocketConnection = () => {
    try {
      console.log('🔌 Setting up WebSocket connection for leaderboard...');
      const ws = setupWebSocket(handleScoreUpdate);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected for leaderboard updates');
        setIsConnected(true);
        toast.success('Real-time updates connected!');
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            setupWebSocketConnection();
          }
        }, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Failed to setup WebSocket:', error);
      toast.error('Failed to connect real-time updates');
    }
  };

  // Initialize component
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard();
      setupWebSocketConnection();
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, team?.year]);

  // Refresh leaderboard manually
  const handleRefresh = () => {
    fetchLeaderboard();
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

  if (loading) {
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
        {lastUpdated && <span>Last updated: {lastUpdated}</span>}
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
