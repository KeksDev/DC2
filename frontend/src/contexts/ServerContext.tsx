'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Server {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  owner: string;
  members: Array<{
    user: string;
    joinedAt: string;
    roles: string[];
  }>;
  channels: Channel[];
  inviteCode?: string;
  privacySettings: {
    inviteOnly: boolean;
    messageRetention: number;
    encryptMessages: boolean;
  };
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'voice';
  server: string;
  description?: string;
  position?: number;
  createdAt: string;
}

interface ServerContextType {
  servers: Server[];
  currentServer: Server | null;
  currentChannel: Channel | null;
  channels: Channel[];
  loading: boolean;
  error: string | null;
  setCurrentServer: (server: Server | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  fetchServers: () => Promise<void>;
  fetchChannels: (serverId: string) => Promise<void>;
  createServer: (name: string, description?: string) => Promise<Server | null>;
  joinServer: (inviteCode: string) => Promise<boolean>;
  createChannel: (serverId: string, name: string, type: 'text' | 'voice', description?: string) => Promise<Channel | null>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const useServer = () => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};

interface ServerProviderProps {
  children: ReactNode;
}

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch user's servers
  const fetchServers = async () => {
    if (!token || !isAuthenticated) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/servers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch servers');
      }

      const data = await response.json();
      if (data.success) {
        setServers(data.servers);
        
        // If no current server and we have servers, set first as current
        if (!currentServer && data.servers.length > 0) {
          setCurrentServer(data.servers[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch servers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch channels for a server
  const fetchChannels = async (serverId: string) => {
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch(`${apiUrl}/api/channels/server/${serverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }

      const data = await response.json();
      if (data.success) {
        setChannels(data.channels);
        
        // If no current channel and we have channels, set first text channel as current
        if (!currentChannel && data.channels.length > 0) {
          const firstTextChannel = data.channels.find((ch: Channel) => ch.type === 'text');
          if (firstTextChannel) {
            setCurrentChannel(firstTextChannel);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch channels');
    }
  };

  // Create a new server
  const createServer = async (name: string, description?: string): Promise<Server | null> => {
    if (!token || !isAuthenticated) return null;

    try {
      const response = await fetch(`${apiUrl}/api/servers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create server');
      }

      const data = await response.json();
      if (data.success) {
        await fetchServers(); // Refresh server list
        return data.server;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create server');
    }
    
    return null;
  };

  // Join a server via invite code
  const joinServer = async (inviteCode: string): Promise<boolean> => {
    if (!token || !isAuthenticated) return false;

    try {
      const response = await fetch(`${apiUrl}/api/servers/join/${inviteCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join server');
      }

      const data = await response.json();
      if (data.success) {
        await fetchServers(); // Refresh server list
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join server');
    }
    
    return false;
  };

  // Create a new channel
  const createChannel = async (serverId: string, name: string, type: 'text' | 'voice', description?: string): Promise<Channel | null> => {
    if (!token || !isAuthenticated) return null;

    try {
      const response = await fetch(`${apiUrl}/api/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, serverId, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create channel');
      }

      const data = await response.json();
      if (data.success) {
        await fetchChannels(serverId); // Refresh channel list
        return data.channel;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create channel');
    }
    
    return null;
  };

  // Custom setCurrentServer that also fetches channels
  const handleSetCurrentServer = (server: Server | null) => {
    setCurrentServer(server);
    setCurrentChannel(null); // Reset current channel
    if (server) {
      fetchChannels(server._id);
    } else {
      setChannels([]);
    }
  };

  // Fetch servers on mount and authentication change
  useEffect(() => {
    if (isAuthenticated) {
      fetchServers();
    } else {
      setServers([]);
      setCurrentServer(null);
      setCurrentChannel(null);
      setChannels([]);
    }
  }, [isAuthenticated, token]);

  // Fetch channels when current server changes
  useEffect(() => {
    if (currentServer) {
      fetchChannels(currentServer._id);
    }
  }, [currentServer]);

  const value: ServerContextType = {
    servers,
    currentServer,
    currentChannel,
    channels,
    loading,
    error,
    setCurrentServer: handleSetCurrentServer,
    setCurrentChannel,
    fetchServers,
    fetchChannels,
    createServer,
    joinServer,
    createChannel,
  };

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
};