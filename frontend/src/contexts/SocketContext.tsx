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
  isConnected: boolean;
  typingUsers: string[];
  sendMessage: (content: string, channelId: string) => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
  updateStatus: (status: string) => void;
  loadMessages: (channelId: string) => Promise<void>;
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
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('user_typing', (data: { userId: string; username: string; channelId: string }) => {
        if (data.userId !== user._id && data.channelId === currentChannelId) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        }
      });

      newSocket.on('user_stop_typing', (data: { userId: string; username: string; channelId: string }) => {
        if (data.userId !== user._id && data.channelId === currentChannelId) {
          setTypingUsers(prev => prev.filter(name => name !== data.username));
        }
      });

      newSocket.on('joined_channel', (data: { channelId: string }) => {
        console.log('Joined channel:', data.channelId);
      });

      newSocket.on('left_channel', (data: { channelId: string }) => {
        console.log('Left channel:', data.channelId);
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
  }, [token, user, serverUrl, currentChannelId]);

  // Load messages for a channel
  const loadMessages = async (channelId: string) => {
    if (!token || !channelId) return;

    // Handle demo channel
    if (channelId === 'demo-general') {
      setMessages([
        {
          _id: 'welcome',
          content: 'Welcome to DC2! This is a privacy-focused Discord alternative. All messages are encrypted end-to-end.',
          author: {
            _id: 'system',
            username: 'DC2 System'
          },
          channelId,
          createdAt: new Date().toISOString(),
          type: 'system'
        }
      ]);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/messages/${channelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages || []);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = (content: string, channelId: string) => {
    if (socket && content.trim()) {
      // Handle demo channel locally to avoid CastError
      if (channelId === 'demo-general') {
        const demoMessage: Message = {
          _id: Date.now().toString(),
          content,
          author: {
            _id: user?._id || 'demo-user',
            username: user?.username || 'Demo User',
            avatar: user?.avatar
          },
          channelId,
          createdAt: new Date().toISOString(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, demoMessage]);
        return;
      }
      
      // For real channels, send to backend
      socket.emit('send_message', {
        content,
        channelId,
        type: 'text'
      });
    }
  };

  const joinChannel = (channelId: string) => {
    if (socket && channelId) {
      // Leave previous channel
      if (currentChannelId) {
        socket.emit('leave_channel', currentChannelId);
      }
      
      setCurrentChannelId(channelId);
      setTypingUsers([]); // Clear typing users
      
      // Join new channel
      if (channelId !== 'demo-general') {
        socket.emit('join_channel', channelId);
      }
      
      // Load messages for the channel
      loadMessages(channelId);
    }
  };

  const leaveChannel = (channelId: string) => {
    if (socket && channelId && channelId !== 'demo-general') {
      socket.emit('leave_channel', channelId);
    }
  };

  const startTyping = (channelId: string) => {
    if (socket && channelId && channelId !== 'demo-general') {
      socket.emit('typing_start', channelId);
    }
  };

  const stopTyping = (channelId: string) => {
    if (socket && channelId && channelId !== 'demo-general') {
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
    isConnected,
    typingUsers,
    sendMessage,
    joinChannel,
    leaveChannel,
    startTyping,
    stopTyping,
    updateStatus,
    loadMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};