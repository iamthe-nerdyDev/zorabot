import React from 'react';
import AlertComponent from './_components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alerts',
};

const Alerts = () => {
  return <AlertComponent />;
};

export default Alerts;
