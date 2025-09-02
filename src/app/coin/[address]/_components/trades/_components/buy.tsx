'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomSidebar } from '@/hooks/useCustomSidebar';
import { useStorage } from '@/hooks/useStorage';
import useTrade from '@/hooks/useTrade';
import { formatNumber, getNativeBalance } from '@/lib/helpers';
import type { LiFiStep } from '@lifi/sdk';
import { usePrivy } from '@privy-io/react-auth';
import { IconGasStation, IconFall } from '@tabler/icons-react';
import debounce from 'lodash.debounce';
import { Wallet2, ChevronRight, Loader2 } from 'lucide-react';
import React from 'react';
import { useAccount } from 'wagmi';
import SettingsSidebar from './settings-sidebar';
import Quote from './quote';
import Ethereum from '@/components/icons/Ethereum';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Buy({ coin }: { coin: Coin }) {
  const [amount, setAmount] = React.useState<number>();
  const [quote, setQuote] = React.useState<LiFiStep | null>();
  const { quote: getQuote, swap } = useTrade();
  const [loading, setLoading] = React.useState(false);
  const { open } = useCustomSidebar();
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const storage = useStorage();

  const { data: balance } = useQuery({
    enabled: !!address,
    queryKey: ['native', address],
    queryFn: async () => {
      return await getNativeBalance(address as any);
    },
  });

  const doSwap = async () => {
    if (loading || !quote) return;
    setLoading(true);

    try {
      await swap(quote);
      toast('Transaction submitted successfully!');
    } catch {
      toast('Could not send transaction');
    } finally {
      setLoading(false);
    }
  };

  const debouncedQuote = React.useMemo(() => {
    return debounce(async (amount: number) => {
      setQuote(undefined); // -- act as loader
      const response = await getQuote(
        'buy',
        '0x4200000000000000000000000000000000000006',
        coin.address,
        BigInt(amount * 10 ** 18).toString()
      );
      // --
      setQuote(response || null);
    }, 400);
  }, []);

  React.useEffect(() => {
    return () => {
      debouncedQuote.cancel();
    };
  }, [debouncedQuote]);

  React.useEffect(() => {
    if (amount) debouncedQuote(amount);
    else setQuote(undefined);
  }, [amount, debouncedQuote]);

  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-1.5 mt-1 mb-3 justify-end">
          <Wallet2 className="size-3.5 opacity-50" />
          <span className="font-semibold text-xs text-green-500">
            {balance === null || typeof balance === 'undefined' ? '-' : formatNumber(balance)} ETH
          </span>
        </p>

        <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
          <span className="text-xs uppercase font-medium w-17 text-center shrink-0">Amount</span>
          <div className="bg-background rounded-lg w-full">
            <Input
              type="number"
              className="w-full h-8.5 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              style={{ fontSize: '13px' }}
              value={String(amount ?? '')}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val)) setAmount(val);
              }}
            />
            <Ethereum
              fill="#aaa"
              className="size-3.5 absolute right-4 opacity-70 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {storage.buyPresets.map((value) => (
            <Button
              key={value}
              className="flex-1 h-10"
              variant={'outline'}
              onClick={() => setAmount(value)}
            >
              <span className="text-[13px]">{value}</span>
              <Ethereum fill="#aaa" className="size-3.5" />
            </Button>
          ))}
        </div>
      </div>

      {quote ? <Quote quote={quote} /> : null}

      <div className="space-y-2.5">
        <Separator />
        <div className="space-y-3.5">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => open({ content: <SettingsSidebar action="buy" /> })}
          >
            <p className="text-xs opacity-60 font-medium">Gas & Slippage</p>
            <div className="flex items-center gap-3">
              <p className="flex items-center gap-1">
                <IconGasStation className="size-4 opacity-60" strokeWidth={1.5} />
                <span className="text-xs font-medium">{storage.buyPriorityFee}</span>
              </p>

              <p className="flex items-center gap-1">
                <IconFall className="size-4 opacity-60" strokeWidth={1.5} />
                <span className="text-xs font-medium">{storage.buySlippage}%</span>
              </p>

              <div className="h-4">
                <Separator orientation="vertical" />
              </div>
              <ChevronRight className="size-4 opacity-60" />
            </div>
          </button>

          <Button
            size={'lg'}
            className="w-full h-11"
            onClick={doSwap}
            disabled={!address || (amount || 0) > (balance || 0) || !quote || loading}
          >
            {(typeof quote === 'undefined' && amount) || (authenticated && !address) ? (
              <Loader2 className="animate-spin opacity-60" />
            ) : null}
            <span>
              {!authenticated
                ? 'Connect wallet'
                : !address
                ? 'Loading wallet'
                : !amount
                ? 'Enter an amount'
                : typeof quote === 'undefined'
                ? 'Fetching Quote'
                : quote === null
                ? 'No route found'
                : amount > (balance || 0)
                ? 'Insufficient Funds'
                : 'Buy Token'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
