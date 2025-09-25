'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Skeleton from 'react-loading-skeleton';
import { Separator } from '../ui/separator';

export default function MarketSkeleton() {
  return (
    <Card className="flex flex-col py-5">
      <CardHeader className="px-5">
        <CardTitle>
          <Skeleton
            className="mb-1.5"
            baseColor="#333"
            highlightColor="#444"
            height={9}
            width={'100%'}
          />
          <Skeleton baseColor="#333" highlightColor="#444" height={9} width={'50%'} />
        </CardTitle>

        <Skeleton baseColor="#333" highlightColor="#444" height={9} width={'25%'} />
      </CardHeader>
      <CardContent className="px-5">
        <div className="flex items-center justify-between">
          <Skeleton baseColor="#333" highlightColor="#444" height={9} width={30} />
          <Skeleton baseColor="#333" highlightColor="#444" height={9} width={30} />
        </div>

        <Skeleton baseColor="#333" highlightColor="#444" height={9} width={'100%'} />
        <Separator className="my-3" />
        <Skeleton baseColor="#333" highlightColor="#444" height={9} width={'30%'} />
      </CardContent>
    </Card>
  );
}
