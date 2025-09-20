import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Play, Square, Search } from 'lucide-react';
import api from '../../utils/api';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [messageSearch, setMessageSearch] = useState('');
  const [statusSearch, setStatusSearch] = useState('');
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getLogs();
      setLogs(response.logs || []);
      setTotalLogs(response.total || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleLogExpansion = (index) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLogStyle = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const filteredLogs = logs
    .slice() // Create a copy to avoid mutating original array
    .reverse() // Reverse the order (newest first)
    .filter(log => {
      const matchesMessage = messageSearch
        ? log.message.toLowerCase().includes(messageSearch.toLowerCase())
        : true;
      
      const matchesStatus = statusSearch
        ? log.meta?.res?.statusCode?.toString().includes(statusSearch) ||
          log.message.includes(statusSearch)
        : true;

      return matchesMessage && matchesStatus;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Server Logs</h1>
          <p className="text-gray-600 mt-2">Monitor and track server activities</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
        >
          <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total Logs: {totalLogs}</span>
              </div>
              {filteredLogs.length !== totalLogs && (
                <div className="text-sm text-blue-600">
                  Found: {filteredLogs.length} matches
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                placeholder="Search by log message..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="relative w-48">
              <input
                type="text"
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                placeholder="Status code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-mono">
                #
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`border rounded-lg transition-colors cursor-pointer ${getLogStyle(log.level)}`}
              >
                <div
                  onClick={() => toggleLogExpansion(index)}
                  className="p-4 flex items-start justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-600">
                      {log.message}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm whitespace-nowrap ml-4">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                
                {expandedLogs.has(index) && log.meta && (
                  <div className="px-4 pb-4 border-t">
                    <pre className="mt-4 p-3 bg-white rounded border text-sm overflow-x-auto">
                      {JSON.stringify(log.meta, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No logs found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}