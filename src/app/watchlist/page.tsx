import { type Metadata } from 'next';
import React from 'react';
import WatchlistComponent from './_components';

export const metadata: Metadata = {
  title: 'Watchlist',
};

const Watchlist = () => {
  return <WatchlistComponent />;
};

export default Watchlist;
