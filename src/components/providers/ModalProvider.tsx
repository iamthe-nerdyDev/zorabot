'use client';

import React, { type PropsWithChildren } from 'react';

type ModalContextProps = {
  isOpen: boolean;
  content?: React.ReactNode;
  open(input: { content: React.ReactNode }): void;
  close(): void;
};

export const ModalContext = React.createContext<ModalContextProps>({
  isOpen: false,
  open() {},
  close() {},
});

export default function ModalProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState<React.ReactNode>();

  function open(input: { content: React.ReactNode; title?: string; backFn?(): void }) {
    setIsOpen(true);
    setContent(input.content);
  }

  function close() {
    setIsOpen(false);
    setContent(false);
  }

  return (
    <ModalContext.Provider value={{ isOpen, content, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}
