'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VoiceChannelProps {
  channelName: string;
  isConnected: boolean;
  connectedUsers: Array<{ id: string; username: string; avatar?: string }>;
  onJoin: () => void;
  onLeave: () => void;
}

const VoiceChannel: React.FC<VoiceChannelProps> = ({
  channelName,
  isConnected,
  connectedUsers,
  onJoin,
  onLeave
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${
        isConnected 
          ? 'bg-[var(--primary)] bg-opacity-20 border-[var(--primary)]' 
          : 'bg-[var(--light-bg)] border-[var(--border-color)]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 3.828 1 1 0 01-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-[var(--text-primary)] font-medium">{channelName}</span>
        </div>
        
        <motion.button
          onClick={isConnected ? onLeave : onJoin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isConnected
              ? 'bg-[var(--danger)] text-white hover:bg-red-600'
              : 'bg-[var(--success)] text-white hover:bg-green-600'
          }`}
        >
          {isConnected ? 'Leave' : 'Join'}
        </motion.button>
      </div>

      {/* Connected Users */}
      {connectedUsers.length > 0 && (
        <div className="space-y-1">
          <div className="text-[var(--text-secondary)] text-xs font-medium">
            Connected ({connectedUsers.length})
          </div>
          {connectedUsers.map((user) => (
            <div key={user.id} className="flex items-center py-1">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-4 h-4 rounded-full mr-2"
                />
              ) : (
                <div className="w-4 h-4 bg-[var(--primary)] rounded-full mr-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-[var(--text-primary)] text-sm">{user.username}</span>
              {/* Voice indicator */}
              <div className="ml-auto">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="w-2 h-2 bg-[var(--success)] rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice controls when connected */}
      {isConnected && (
        <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-[var(--border-color)]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-[var(--dark-bg)] rounded-full hover:bg-[var(--light-bg)] transition-colors"
            title="Mute/Unmute"
          >
            <svg className="w-4 h-4 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-[var(--dark-bg)] rounded-full hover:bg-[var(--light-bg)] transition-colors"
            title="Deafen"
          >
            <svg className="w-4 h-4 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-[var(--dark-bg)] rounded-full hover:bg-[var(--light-bg)] transition-colors"
            title="Settings"
          >
            <svg className="w-4 h-4 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
          </motion.button>
        </div>
      )}

      {/* Placeholder message for voice not implemented */}
      {isConnected && (
        <div className="mt-2 p-2 bg-[var(--warning)] bg-opacity-20 border border-[var(--warning)] rounded text-center">
          <span className="text-[var(--warning)] text-xs">
            🚧 Voice chat coming soon! WebRTC implementation in progress.
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default VoiceChannel;