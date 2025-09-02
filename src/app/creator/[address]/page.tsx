import React from 'react';
import CreatorComponent from './_components';
import { Metadata } from 'next';
import { BASE_URL } from '@/lib/constants';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { address } = await params;
  const res = await fetch(`${BASE_URL}/api/creator?address=${address}`, { cache: 'no-store' });
  // --
  const data = (await res.json()).data as ZoraProfileAdvance | null;
  return {
    title: data ? `${data.displayName}` : 'Zora User',
    description: data?.bio,
  };
}

const Creator = async ({ params }: any) => {
  const { address } = await params;
  const res = await fetch(`${BASE_URL}/api/creator?address=${address}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  // --
  if (!res.ok) notFound();
  const data = (await res.json()).data as ZoraProfileAdvance;

  return <CreatorComponent data={data} />;
};

export default Creator;
