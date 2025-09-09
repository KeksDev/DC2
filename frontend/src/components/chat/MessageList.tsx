'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Info } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  channelId: string;
  createdAt: string;
  editedAt?: string;
  type?: string;
}

export default function MessageList() {
  const { messages } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.author._id === user?._id;
  };

  const isSystemMessage = (message: Message) => {
    return message.type === 'system';
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-2 space-y-4">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] ${
                isOwnMessage(message) ? 'flex-row-reverse' : 'flex-row'
              } ${isSystemMessage(message) ? 'justify-center w-full max-w-none' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 ${
                  isOwnMessage(message) ? 'ml-3' : 'mr-3'
                } ${isSystemMessage(message) ? 'hidden' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-light-bg flex items-center justify-center">
                  {message.author.avatar ? (
                    <img
                      src={message.author.avatar}
                      alt={message.author.username}
                      className="w-full h-full rounded-full"
                    />
                  ) : isSystemMessage(message) ? (
                    <Info className="w-5 h-5 text-privacy" />
                  ) : (
                    <User className="w-5 h-5 text-text-secondary" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col ${
                  isSystemMessage(message) ? 'items-center' : ''
                }`}
              >
                {/* Message Header */}
                {!isSystemMessage(message) && (
                  <div
                    className={`flex items-center mb-1 ${
                      isOwnMessage(message) ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <span
                      className={`font-medium text-sm ${
                        isOwnMessage(message) ? 'text-primary' : 'text-text-primary'
                      }`}
                    >
                      {message.author.username}
                    </span>
                    <span
                      className={`text-xs text-text-muted ${
                        isOwnMessage(message) ? 'mr-2' : 'ml-2'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                    {message.editedAt && (
                      <span className="text-xs text-text-muted ml-1">(edited)</span>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`px-4 py-2 rounded-lg ${
                    isSystemMessage(message)
                      ? 'bg-privacy/20 border border-privacy/30 text-privacy text-center max-w-md'
                      : isOwnMessage(message)
                      ? 'bg-primary text-white'
                      : 'bg-light-bg text-text-primary'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </motion.div>

                {/* System Message Icon */}
                {isSystemMessage(message) && (
                  <div className="mt-2 w-8 h-8 rounded-full bg-privacy/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-privacy" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}