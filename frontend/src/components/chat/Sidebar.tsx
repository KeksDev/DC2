'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, LogOut, Hash, Volume2, Plus, Users, MessageCircle, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useServer } from '@/contexts/ServerContext';
import { useLanguage } from './LanguageSelector';
import ServerCreateModal from './ServerCreateModal';
import LanguageSelector from './LanguageSelector';

interface SidebarProps {
  onOpenPrivacySettings: () => void;
}

export default function Sidebar({ onOpenPrivacySettings }: SidebarProps) {
  const { user, logout } = useAuth();
  const { updateStatus } = useSocket();
  const { 
    servers, 
    currentServer, 
    currentChannel,
    channels, 
    loading, 
    setCurrentServer, 
    setCurrentChannel,
    createServer,
    joinServer
  } = useServer();
  const { t } = useLanguage();
  
  const [userStatus, setUserStatus] = useState(user?.status || 'online');
  const [showServerCreateModal, setShowServerCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleStatusChange = (newStatus: string) => {
    setUserStatus(newStatus);
    updateStatus(newStatus);
  };

  const handleCreateServer = async (data: { name: string; description: string }) => {
    await createServer(data.name, data.description);
  };

  const handleJoinServer = async () => {
    if (inviteCode.trim()) {
      const success = await joinServer(inviteCode.trim());
      if (success) {
        setInviteCode('');
        setShowJoinModal(false);
      }
    }
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

        {/* Server Name */}
        {currentServer && (
          <div className="mb-4">
            <h3 className="text-text-primary font-semibold truncate">{currentServer.name}</h3>
            {currentServer.description && (
              <p className="text-text-muted text-sm truncate">{currentServer.description}</p>
            )}
          </div>
        )}

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
        {/* Server List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider">
              Servers
            </h3>
            <div className="flex space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowServerCreateModal(true)}
                className="p-1 text-text-muted hover:text-text-primary hover:bg-light-bg rounded"
                title="Create Server"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowJoinModal(true)}
                className="p-1 text-text-muted hover:text-text-primary hover:bg-light-bg rounded"
                title="Join Server"
              >
                <Users className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          <div className="space-y-1">
            {loading ? (
              <div className="text-text-muted text-sm italic">Loading servers...</div>
            ) : servers.length === 0 ? (
              <div className="text-text-muted text-sm italic">No servers joined yet</div>
            ) : (
              servers.map((server) => (
                <motion.div
                  key={server._id}
                  whileHover={{ x: 4 }}
                  onClick={() => setCurrentServer(server)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentServer?._id === server._id
                      ? 'text-text-primary bg-light-bg'
                      : 'text-text-secondary hover:text-text-primary hover:bg-light-bg'
                  }`}
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                    {server.icon ? (
                      <img src={server.icon} alt={server.name} className="w-full h-full rounded-lg" />
                    ) : (
                      <span className="text-primary font-semibold text-sm">
                        {server.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{server.name}</span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Channels - Only show if a server is selected */}
        {currentServer && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-3">
              Channels
            </h3>
            <div className="space-y-1">
              {channels.length === 0 ? (
                <div className="text-text-muted text-sm italic">No channels available</div>
              ) : (
                channels.map((channel) => (
                  <motion.div
                    key={channel._id}
                    whileHover={{ x: 4 }}
                    onClick={() => setCurrentChannel(channel)}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentChannel?._id === channel._id
                        ? 'text-text-primary bg-light-bg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-light-bg'
                    }`}
                  >
                    {channel.type === 'voice' ? (
                      <Volume2 className="w-4 h-4 mr-3 text-text-muted" />
                    ) : (
                      <Hash className="w-4 h-4 mr-3 text-text-muted" />
                    )}
                    <span className="text-sm font-medium">{channel.name}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Direct Messages - Show if no server selected */}
        {!currentServer && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
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
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="p-4 border-t border-border space-y-2"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLanguageSelector(true)}
          className="w-full flex items-center justify-center py-2 px-4 bg-light-bg hover:bg-border text-text-primary rounded-lg transition-all duration-200"
        >
          <Globe className="w-4 h-4 mr-2" />
          {t('language')}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenPrivacySettings}
          className="w-full flex items-center justify-center py-2 px-4 bg-privacy/20 hover:bg-privacy/30 text-privacy rounded-lg transition-all duration-200"
        >
          <Shield className="w-4 h-4 mr-2" />
          {t('privacySettings')}
        </motion.button>
      </motion.div>

      {/* Language Selector */}
      <AnimatePresence>
        {showLanguageSelector && (
          <LanguageSelector
            isOpen={showLanguageSelector}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Server Create Modal */}
      <AnimatePresence>
        {showServerCreateModal && (
          <ServerCreateModal
            isOpen={showServerCreateModal}
            onClose={() => setShowServerCreateModal(false)}
            onCreateServer={handleCreateServer}
          />
        )}
      </AnimatePresence>

      {/* Join Server Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-bg rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Join Server
              </h2>
              <div className="mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-text-secondary mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-3 py-2 bg-darker-bg border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter invite code"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinServer}
                  disabled={!inviteCode.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Join Server
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}