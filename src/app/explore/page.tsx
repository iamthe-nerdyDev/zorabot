import { type Metadata } from 'next';
import React from 'react';
import ExploreComponent from './_components';

export const metadata: Metadata = {
  title: 'Explore',
};

const Explore = () => {
  return <ExploreComponent />;
};

export default Explore;
