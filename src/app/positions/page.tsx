import React from 'react';
import type { Metadata } from 'next';
import PositionsComponent from './_components';

export const metadata: Metadata = {
  title: 'Positions',
};

const Positions = () => {
  return <PositionsComponent />;
};

export default Positions;
