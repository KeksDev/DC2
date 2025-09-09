'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ServerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateServer: (data: { name: string; description: string }) => Promise<void>;
}

const ServerCreateModal: React.FC<ServerCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateServer
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await onCreateServer({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating server:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--dark-bg)] rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Create Server
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="serverName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Server Name
            </label>
            <input
              type="text"
              id="serverName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 bg-[var(--darker-bg)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter server name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="serverDescription" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Description (Optional)
            </label>
            <textarea
              id="serverDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--darker-bg)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              placeholder="Describe your server"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={!name.trim() || isCreating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Server'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ServerCreateModal;