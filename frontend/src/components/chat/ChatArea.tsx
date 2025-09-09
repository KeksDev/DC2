'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, Info, Settings, Paperclip, Send, Lock } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';

export default function ChatArea() {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, currentChannel, startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = () => {
    if (messageInput.trim() && currentChannel) {
      sendMessage(messageInput.trim(), currentChannel);
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
      startTyping(currentChannel);
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
      stopTyping(currentChannel);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
          <Hash className="w-5 h-5 text-text-muted mr-2" />
          <div>
            <h1 className="text-lg font-semibold text-text-primary">general</h1>
            <p className="text-sm text-text-secondary">Welcome to DC2!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
            title="Privacy Info"
          >
            <Info className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-light-bg rounded-lg transition-all duration-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
                placeholder="Type a message... (Messages are encrypted)"
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
      </div>
    </div>
  );
}