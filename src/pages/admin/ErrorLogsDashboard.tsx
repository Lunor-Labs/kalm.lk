import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Search, Filter, Download } from 'lucide-react';
import { errorLogger, ErrorLog } from '../../lib/errorLogger';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ErrorLogsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');

  useEffect(() => {
    loadErrorLogs();
  }, []);

  const loadErrorLogs = async () => {
    try {
      setLoading(true);
      const logs = await errorLogger.getRecentErrors(100);
      setErrorLogs(logs);
    } catch (error) {
      console.error('Failed to load error logs:', error);
      toast.error('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = errorLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.additionalData?.component?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.errorType === filterType;
    const matchesEnvironment = filterEnvironment === 'all' || log.environment === filterEnvironment;

    return matchesSearch && matchesType && matchesEnvironment;
  });

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'auth': return 'bg-red-100 text-red-800';
      case 'payment': return 'bg-yellow-100 text-yellow-800';
      case 'network': return 'bg-blue-100 text-blue-800';
      case 'storage': return 'bg-purple-100 text-purple-800';
      case 'ui': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(timestamp);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Environment', 'User ID', 'Message', 'URL', 'User Agent', 'Stack'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.errorType,
        log.environment,
        log.userId || '',
        `"${log.message.replace(/"/g, '""')}"`,
        log.url,
        `"${log.userAgent.replace(/"/g, '""')}"`,
        `"${(log.stack || '').replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Error Logs Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor user-facing errors and system issues
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadErrorLogs}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportLogs}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search errors..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Error Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="auth">Authentication</option>
              <option value="payment">Payment</option>
              <option value="network">Network</option>
              <option value="storage">Storage</option>
              <option value="ui">UI Errors</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <select
              value={filterEnvironment}
              onChange={(e) => setFilterEnvironment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="development">Development</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {errorLogs.length} errors
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-6 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Loading error logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No errors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {errorLogs.length === 0 ? 'No error logs available.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <li key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getErrorTypeColor(log.errorType)}`}>
                        {log.errorType}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.environment === 'production' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {log.environment}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {log.message}
                    </p>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>User ID:</strong> {log.userId || 'Anonymous'}</div>
                      <div><strong>URL:</strong> {log.url}</div>
                      {log.additionalData && (
                        <div><strong>Additional:</strong> {JSON.stringify(log.additionalData)}</div>
                      )}
                    </div>

                    {log.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Show stack trace
                        </summary>
                        <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ErrorLogsDashboard;
