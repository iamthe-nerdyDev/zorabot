import { type Metadata } from 'next';
import React from 'react';
import PortfolioComponent from './_components';

export const metadata: Metadata = {
  title: 'Portfolio',
};

const Portfolio = () => {
  return <PortfolioComponent />;
};

export default Portfolio;
