'use client';

import { ModalContext } from '@/components/providers/ModalProvider';
import React from 'react';

export default function () {
  const context = React.useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within the ModalProvider');
  // --
  return context;
}
