'use client';

import { Input } from '@/components/ui/input';
import { useCustomSidebar } from '@/hooks/useCustomSidebar';
import { useStorage } from '@/hooks/useStorage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { IconGasStation, IconFall } from '@tabler/icons-react';
import { Bolt, X } from 'lucide-react';

export default function SettingsSidebar(props: { action: 'buy' | 'sell' }) {
  const storage = useStorage();
  const { close } = useCustomSidebar();

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bolt className="opacity-60 size-3.5" strokeWidth={2} />
          <span className="font-medium text-sm">Order Settings</span>
        </div>

        <button onClick={close}>
          <X className="size-4 opacity-60" />
        </button>
      </div>

      <div className="p-4">
        <Tabs defaultValue={`${props.action}-settings`} className="w-full max-w-md mx-auto">
          <TabsList className="w-full h-10">
            <TabsTrigger value="buy-settings">
              <span className="text-[13px]">Buy Settings</span>
            </TabsTrigger>
            <TabsTrigger value="sell-settings">
              <span className="text-[13px]">Sell Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy-settings">
            <div className="py-3 space-y-6.5">
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconGasStation className="text-green-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Buy Priority Fee
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-13 text-center shrink-0">
                    PRIO
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      type="number"
                      style={{ fontSize: '13px' }}
                      value={String(storage.buyPriorityFee)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) storage.setBuyPriorityFee(Number(value));
                      }}
                    />
                    <span className="absolute right-5.5 opacity-70 text-xs font-medium top-1/2 -translate-y-1/2">
                      GWEI
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconFall className="text-green-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Buy Slippage Limit
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-15 text-center shrink-0">
                    Max %
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      style={{ fontSize: '13px' }}
                      max={100}
                      min={0}
                      value={String(storage.buySlippage)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) {
                          if (Number(value) < 0) storage.setBuySlippage(0);
                          else if (Number(value) > 100) storage.setBuySlippage(100);
                          else storage.setBuySlippage(Number(value));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="sell-settings">
            <div className="py-3 space-y-6.5">
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconGasStation className="text-red-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Sell Priority Fee
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-13 text-center shrink-0">
                    PRIO
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      type="number"
                      style={{ fontSize: '13px' }}
                      value={String(storage.sellPriorityFee)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) storage.setSellPriorityFee(Number(value));
                      }}
                    />
                    <span className="absolute right-5.5 opacity-70 text-xs font-medium top-1/2 -translate-y-1/2">
                      GWEI
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <IconFall className="text-red-400 size-4.5" />
                  <p className="uppercase text-[13px] font-medium border-b-2 border-dotted border-gray-500">
                    Sell Slippage Limit
                  </p>
                </div>

                <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
                  <span className="text-xs uppercase font-medium w-15 text-center shrink-0">
                    Max %
                  </span>
                  <div className="bg-background rounded-lg w-full">
                    <Input
                      className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      style={{ fontSize: '13px' }}
                      max={100}
                      min={0}
                      value={String(storage.sellSlippage)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!isNaN(Number(value))) {
                          if (Number(value) < 0) storage.setSellSlippage(0);
                          else if (Number(value) > 100) storage.setSellSlippage(100);
                          else storage.setSellSlippage(Number(value));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
