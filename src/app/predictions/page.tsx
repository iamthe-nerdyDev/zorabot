import React from 'react';
import PredictionsComponent from './_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Predictions',
};

export default function Predictions() {
  return <PredictionsComponent />;
}
