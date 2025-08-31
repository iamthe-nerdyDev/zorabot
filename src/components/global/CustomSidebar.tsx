'use client';

import { useCustomSidebar } from '@/hooks/useCustomSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export default function CustomSidebar() {
  const { state, close, content } = useCustomSidebar();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state) close();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state, close]);

  return (
    <AnimatePresence>
      {state && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={close}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="fixed right-0 top-0 bottom-0 h-svh w-full md:w-sm z-50 bg-background border-l"
          >
            {content}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
