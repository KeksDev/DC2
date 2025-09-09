'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Volume2, Info, Settings, Paperclip, Send, Lock } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useServer } from '@/contexts/ServerContext';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import FileUploadModal from './FileUploadModal';

export default function ChatArea() {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { sendMessage, startTyping, stopTyping, joinChannel } = useSocket();
  const { currentChannel, currentServer } = useServer();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join channel when it changes
  useEffect(() => {
    if (currentChannel) {
      joinChannel(currentChannel._id);
    }
  }, [currentChannel, joinChannel]);

  const handleSendMessage = () => {
    if (messageInput.trim() && currentChannel) {
      sendMessage(messageInput.trim(), currentChannel._id);
      setMessageInput('');
      handleStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key !== 'Enter') {
      handleStartTyping();
    }
  };

  const handleStartTyping = () => {
    if (!isTyping && currentChannel) {
      setIsTyping(true);
      startTyping(currentChannel._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping && currentChannel) {
      setIsTyping(false);
      stopTyping(currentChannel._id);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleFileUpload = async (files: FileList) => {
    // TODO: Implement file upload integration with backend
    console.log('Files to upload:', files);
    setShowFileUpload(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // If no channel is selected, show welcome screen
  if (!currentChannel) {
    return (
      <div className="h-full flex items-center justify-center bg-darker-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {currentServer ? 'Select a channel' : 'Welcome to DC2'}
          </h2>
          <p className="text-text-secondary">
            {currentServer 
              ? 'Choose a channel to start chatting'
              : 'Select a server and channel to begin messaging'
            }
          </p>
        </motion.div>
      </div>
    );
  }

  const channelIcon = currentChannel.type === 'voice' ? Volume2 : Hash;

  return (
    <div className="h-full flex flex-col">
      {/* Channel Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-4 border-b border-border bg-dark-bg"
      >
        <div className="flex items-center">
          {React.createElement(channelIcon, { 
            className: "w-5 h-5 text-text-muted mr-2" 
          })}
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {currentChannel.name}
            </h1>
            <p className="text-sm text-text-secondary">
              {currentChannel.description || 
                (currentChannel.type === 'voice' ? 'Voice channel' : 'Text channel')
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
            title="Channel Info"
          >
            <Info className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
            title="Channel Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentChannel.type === 'voice' ? (
          // Voice Channel UI
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center bg-darker-bg"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Voice Channel
              </h3>
              <p className="text-text-secondary mb-6">
                Voice chat features are coming soon!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                Join Voice (Coming Soon)
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Text Channel UI
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1 overflow-hidden"
            >
              <MessageList />
            </motion.div>

            {/* Typing Indicator */}
            <TypingIndicator />

            {/* Message Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="p-4 border-t border-border bg-dark-bg"
            >
              <div className="flex items-end space-x-2 mb-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFileUpload(true)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
                  title="Upload File"
                >
                  <Paperclip className="w-4 h-4" />
                </motion.button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${currentChannel.name}... (Messages are encrypted)`}
                    className="w-full px-4 py-3 bg-light-bg border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200"
                    autoComplete="off"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Privacy Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center text-xs text-text-muted"
              >
                <Lock className="w-3 h-3 mr-1" />
                <span>Messages are end-to-end encrypted and automatically deleted after 30 days</span>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {/* File Upload Modal */}
      <AnimatePresence>
        {showFileUpload && (
          <FileUploadModal
            isOpen={showFileUpload}
            onClose={() => setShowFileUpload(false)}
            onUpload={handleFileUpload}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedTypes={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
              'text/*': ['.txt'],
              'application/pdf': ['.pdf'],
              'audio/*': ['.mp3', '.wav'],
              'video/*': ['.mp4', '.webm']
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}