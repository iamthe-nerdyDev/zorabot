'use client';

import useModal from '@/hooks/useModal';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export default function Modal() {
  const { isOpen, content, close } = useModal();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            className="fixed inset-0 h-dvh bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            variants={{
              hidden: {
                x: '100%',
                opacity: 0,
                scale: 0.95,
              },
              visible: {
                x: '0%',
                opacity: 1,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                },
              },
              exit: {
                x: '100%',
                opacity: 0,
                scale: 0.95,
                transition: {
                  duration: 0.3,
                  ease: 'easeInOut',
                },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
            className="fixed inset-0 h-dvh backdrop-blur-sm p-4 z-50 overflow-y-auto"
          >
            <div
              className="max-w-lg w-full rounded-md bg-[#111] mx-auto mt-12 mb-8 border"
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
