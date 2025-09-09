'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  currentChannel: string | null;
  isConnected: boolean;
  typingUsers: string[];
  sendMessage: (content: string, channelId: string) => void;
  joinChannel: (channelId: string) => void;
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
  updateStatus: (status: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>('demo-general');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    if (token && user) {
      const newSocket = io(serverUrl, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
        
        // Add welcome message for demo
        setMessages([{
          _id: 'welcome',
          content: 'Welcome to DC2! This is a privacy-focused Discord alternative. All messages are encrypted end-to-end.',
          author: {
            _id: 'system',
            username: 'DC2 System'
          },
          channelId: 'demo-general',
          createdAt: new Date().toISOString(),
          type: 'system'
        }]);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('user_typing', (data: { userId: string; username: string }) => {
        if (data.userId !== user._id) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        }
      });

      newSocket.on('user_stop_typing', (data: { userId: string; username: string }) => {
        if (data.userId !== user._id) {
          setTypingUsers(prev => prev.filter(name => name !== data.username));
        }
      });

      newSocket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [token, user, serverUrl]);

  const sendMessage = (content: string, channelId: string) => {
    if (socket && content.trim()) {
      socket.emit('send_message', {
        content,
        channelId,
        type: 'text'
      });
    }
  };

  const joinChannel = (channelId: string) => {
    setCurrentChannel(channelId);
    // Filter messages for the channel
    // In a real app, you'd load messages from the server
  };

  const startTyping = (channelId: string) => {
    if (socket) {
      socket.emit('typing_start', channelId);
    }
  };

  const stopTyping = (channelId: string) => {
    if (socket) {
      socket.emit('typing_stop', channelId);
    }
  };

  const updateStatus = (status: string) => {
    if (socket) {
      socket.emit('update_status', status);
    }
  };

  const value = {
    socket,
    messages,
    currentChannel,
    isConnected,
    typingUsers,
    sendMessage,
    joinChannel,
    startTyping,
    stopTyping,
    updateStatus
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};