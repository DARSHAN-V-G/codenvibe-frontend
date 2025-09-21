import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { setupLeaderboardWebSocket, LeaderboardEntry } from '../api';


interface WebSocketContextType {
  isConnected: boolean;
  lastUpdate: string;
  leaderboardData: LeaderboardEntry[];
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastUpdate: '',
  leaderboardData: [],
});

export const useWebSocket = () => useContext(WebSocketContext);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // Debug current state
  useEffect(() => {
  }, []);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const setupWebSocketConnection = () => {
    try {
      const ws = setupLeaderboardWebSocket((data) => {
        const userYear = parseInt(localStorage.getItem('year') || '0', 10);

        if (!userYear) {
          return;
        }

        if (!Array.isArray(data)) {
          return;
        }

        const filteredData = data
          .filter(entry => {
            const matches = entry.year === userYear;
            return matches;
          })
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        setLeaderboardData(filteredData);
        setLastUpdate(new Date().toLocaleTimeString());
      });
      
      ws.onopen = () => {
        setIsConnected(true);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        // Check if year still exists before attempting reconnection
        const hasYear = !!localStorage.getItem('year');
        if (hasYear) {
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              setupWebSocketConnection();
            }
          }, 5000);
        }
      };
      
      ws.onerror = () => {
        setIsConnected(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
    }
  };

  // Check for user's year in localStorage
  useEffect(() => {
    const checkYearAndConnect = () => {
      const hasYear = !!localStorage.getItem('year');
      if (hasYear && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
        setupWebSocketConnection();
      } else if (!hasYear && wsRef.current) {
        wsRef.current.close();
      }
    };

    // Initial check
    checkYearAndConnect();

    // Setup interval to check year
    const intervalId = setInterval(checkYearAndConnect, 30000);

    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastUpdate, leaderboardData }}>
      {children}
    </WebSocketContext.Provider>
  );
}