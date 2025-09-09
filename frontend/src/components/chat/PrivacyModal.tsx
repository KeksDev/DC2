'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const { user, updateUser, token } = useAuth();
  const [settings, setSettings] = useState({
    allowDirectMessages: 'friends',
    showOnlineStatus: true,
    dataRetention: 30
  });
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user?.privacySettings) {
      setSettings({
        allowDirectMessages: user.privacySettings.allowDirectMessages || 'friends',
        showOnlineStatus: user.privacySettings.showOnlineStatus !== false,
        dataRetention: user.privacySettings.dataRetention || 30
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ privacySettings: settings })
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-dark-bg rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-privacy mr-2" />
              <h2 className="text-xl font-semibold text-text-primary">Privacy Settings</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Direct Messages */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Allow Direct Messages From:
              </label>
              <select
                value={settings.allowDirectMessages}
                onChange={(e) => setSettings(prev => ({ ...prev, allowDirectMessages: e.target.value }))}
                className="w-full px-3 py-2 bg-light-bg border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="none">No One</option>
              </select>
            </div>

            {/* Online Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showOnlineStatus}
                  onChange={(e) => setSettings(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-light-bg border-border rounded focus:ring-primary focus:ring-2"
                />
                <span className="ml-2 text-sm text-text-primary">Show Online Status</span>
              </label>
            </div>

            {/* Data Retention */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Message Retention (days):
              </label>
              <select
                value={settings.dataRetention}
                onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-light-bg border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            {/* Privacy Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-privacy/10 border border-privacy/30 p-4 rounded-lg"
            >
              <div className="flex items-start">
                <Info className="w-4 h-4 text-privacy mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-privacy mb-2">Your Privacy Rights</h4>
                  <ul className="text-xs text-text-secondary space-y-1">
                    <li>• All messages are encrypted end-to-end</li>
                    <li>• We don&apos;t sell your data to third parties</li>
                    <li>• Messages are automatically deleted based on your retention settings</li>
                    <li>• You can export or delete all your data at any time</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-4 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}