'use client';

import React from 'react';
import { useConnect } from 'wagmi';

export default function WatchlistComponent() {
  const { connect, connectors } = useConnect();

  return <div>{JSON.stringify(connectors)}</div>;
}
