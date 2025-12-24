import React, { useState, useEffect } from 'react';
import { Clock, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getSessionConfig, updateSessionConfig, SessionConfig } from '../../lib/sessions';
import toast from 'react-hot-toast';

const SessionConfigManagement: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    joinEarlyMinutes: 15,
    joinLateMinutes: 30,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const currentConfig = await getSessionConfig();
      setConfig(currentConfig);
      setFormData({
        joinEarlyMinutes: currentConfig.joinEarlyMinutes,
        joinLateMinutes: currentConfig.joinLateMinutes,
      });
    } catch (error) {
      console.error('Failed to load session config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);

      // Validate input
      if (formData.joinEarlyMinutes < 0 || formData.joinEarlyMinutes > 1440) {
        toast.error('Join early minutes must be between 0 and 1440');
        return;
      }

      if (formData.joinLateMinutes < 0 || formData.joinLateMinutes > 1440) {
        toast.error('Join late minutes must be between 0 and 1440');
        return;
      }

      await updateSessionConfig(formData, user.uid);
      toast.success('Session configuration updated successfully');
      await loadConfig(); // Reload to show updated config
    } catch (error) {
      console.error('Failed to save session config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Session Configuration</h1>
        <p className="text-neutral-300">
          Configure timing rules for when clients and therapists can join video sessions
        </p>
      </div>

      <div className="bg-neutral-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-semibold text-white">Join Timing Rules</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Join Early Window (minutes before session start)
            </label>
            <input
              type="number"
              min="0"
              max="1440"
              value={formData.joinEarlyMinutes}
              onChange={(e) => handleInputChange('joinEarlyMinutes', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="15"
            />
            <p className="text-xs text-neutral-400 mt-1">
              How many minutes before the session starts can users join? (Default: 15 minutes)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Join Late Window (minutes after session end)
            </label>
            <input
              type="number"
              min="0"
              max="1440"
              value={formData.joinLateMinutes}
              onChange={(e) => handleInputChange('joinLateMinutes', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="30"
            />
            <p className="text-xs text-neutral-400 mt-1">
              How many minutes after the session ends can users still join? (Default: 30 minutes)
            </p>
          </div>
        </div>

        {/* Current Configuration Display */}
        {config && (
          <div className="mb-6 p-4 bg-neutral-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-3">Current Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-400">Join Early:</span>
                <span className="text-white ml-2">{config.joinEarlyMinutes} minutes before</span>
              </div>
              <div>
                <span className="text-neutral-400">Join Late:</span>
                <span className="text-white ml-2">{config.joinLateMinutes} minutes after</span>
              </div>
              <div>
                <span className="text-neutral-400">Last Updated:</span>
                <span className="text-white ml-2">{config.updatedAt.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-400">Updated By:</span>
                <span className="text-white ml-2">{config.updatedBy}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>

          <button
            onClick={loadConfig}
            className="flex items-center space-x-2 bg-neutral-700 text-white px-6 py-3 rounded-xl hover:bg-neutral-600 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Example Scenarios */}
        <div className="mt-8 p-4 bg-neutral-700/30 rounded-xl">
          <h3 className="text-lg font-medium text-white mb-3">Example Scenarios</h3>
          <div className="space-y-2 text-sm text-neutral-300">
            <p>• Session starts at 2:00 PM</p>
            <p>• With current settings, users can join from 1:45 PM to 2:30 PM</p>
            <p>• If session is 60 minutes long, join window ends at 3:30 PM</p>
            <p>• Active sessions can always be joined regardless of timing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionConfigManagement;
