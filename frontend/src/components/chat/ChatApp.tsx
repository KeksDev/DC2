'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import PrivacyModal from './PrivacyModal';

export default function ChatApp() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="h-screen flex bg-darker-bg overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-80 flex-shrink-0 hidden md:block"
      >
        <Sidebar onOpenPrivacySettings={() => setShowPrivacyModal(true)} />
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 flex flex-col"
      >
        <ChatArea />
      </motion.div>

      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}