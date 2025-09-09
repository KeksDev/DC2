'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, LogOut, Hash, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

interface SidebarProps {
  onOpenPrivacySettings: () => void;
}

export default function Sidebar({ onOpenPrivacySettings }: SidebarProps) {
  const { user, logout } = useAuth();
  const { updateStatus } = useSocket();
  const [userStatus, setUserStatus] = useState(user?.status || 'online');

  const handleStatusChange = (newStatus: string) => {
    setUserStatus(newStatus);
    updateStatus(newStatus);
  };

  const statusOptions = [
    { value: 'online', label: '🟢 Online', color: 'text-green-400' },
    { value: 'away', label: '🟡 Away', color: 'text-yellow-400' },
    { value: 'busy', label: '🔴 Busy', color: 'text-red-400' },
    { value: 'invisible', label: '⚫ Invisible', color: 'text-gray-400' }
  ];

  return (
    <div className="h-full bg-dark-bg border-r border-border flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 border-b border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-privacy mr-2" />
            <h2 className="text-xl font-bold text-text-primary">DC2</h2>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 bg-light-bg rounded-full flex items-center justify-center mr-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full" />
              ) : (
                <User className="w-5 h-5 text-text-secondary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{user?.username}</p>
              <select
                value={userStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-transparent text-xs text-text-secondary border-none outline-none cursor-pointer"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-dark-bg">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Direct Messages */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-3">
            Direct Messages
          </h3>
          <div className="space-y-1">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center p-2 text-text-secondary hover:text-text-primary hover:bg-light-bg rounded-lg cursor-pointer transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 mr-3" />
              <span className="text-sm">Find or start a conversation</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Channels */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-3">
            Channels
          </h3>
          <div className="space-y-1">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center p-2 text-text-primary bg-light-bg rounded-lg cursor-pointer transition-all duration-200"
            >
              <Hash className="w-4 h-4 mr-3 text-text-muted" />
              <span className="text-sm font-medium">general</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Server List Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-3">
            Servers
          </h3>
          <div className="text-text-muted text-sm italic">
            No servers joined yet
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="p-4 border-t border-border"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenPrivacySettings}
          className="w-full flex items-center justify-center py-2 px-4 bg-privacy/20 hover:bg-privacy/30 text-privacy rounded-lg transition-all duration-200"
        >
          <Shield className="w-4 h-4 mr-2" />
          Privacy Settings
        </motion.button>
      </motion.div>
    </div>
  );
}