'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';

export default function TypingIndicator() {
  const { typingUsers } = useSocket();

  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="px-4 py-2 text-sm text-text-muted"
      >
        <div className="flex items-center">
          <span>{getTypingText()}</span>
          <div className="flex space-x-1 ml-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-1 h-1 bg-text-muted rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}