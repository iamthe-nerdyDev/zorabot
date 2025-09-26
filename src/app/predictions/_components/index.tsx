'use client';

import React from 'react';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { IconClock24, IconFlame, IconPlaylistAdd } from '@tabler/icons-react';
import RenderMarkets from './render-markets';

export default function PredictionsComponent() {
  const [activeTab, setActiveTab] = React.useState('trending');

  const map: any = {
    trending: {
      icon: IconFlame,
      text: 'Trending Markets',
    },
    'ending-soon': {
      icon: IconClock24,
      text: 'Markets Ending Soon',
    },
    newest: {
      icon: IconPlaylistAdd,
      text: 'Newest Markets',
    },
  };

  const Icon = map[activeTab].icon;

  return (
    <div>
      <div className="border-b">
        <img src={'/predictions.png'} className="w-full h-auto" />
      </div>

      <div className="pb-20 mb:pb-0">
        <div>
          <Tabs
            defaultValue="newest"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col gap-3 sm:flex-row md:items-center justify-between border-b py-2 px-3">
              <h1 className="font-normal text-xl w-full flex items-center gap-2">
                <Icon className="size-5.5 opacity-60" />
                <span>{map[activeTab].text}</span>
              </h1>

              <TabsList className="w-full sm:max-w-md mx-auto h-10">
                <TabsTrigger value="newest">Newest</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="newest">
              <RenderMarkets filter="newest" />
            </TabsContent>
            <TabsContent value="trending">
              <RenderMarkets filter="trending" />
            </TabsContent>
            <TabsContent value="ending-soon">
              <RenderMarkets filter="ending-soon" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
