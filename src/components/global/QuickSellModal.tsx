'use client';

import useModal from '@/hooks/useModal';
import { useStorage } from '@/hooks/useStorage';
import { ArrowRight, Loader2, Percent, X } from 'lucide-react';
import React from 'react';
import { Input } from '../ui/input';
import SmartImage from './SmartImage';
import { Button } from '../ui/button';
import type { LiFiStep } from '@lifi/sdk';
import useTrade from '@/hooks/useTrade';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import debounce from 'lodash.debounce';
import { toNumber } from '@/lib/helpers';
import Quote from '@/app/coin/[address]/_components/trades/_components/quote';
import { toast } from 'sonner';

type Props = {
  balance: string;
  coin: Coin;
};

export default function QuickSellModal({ balance, coin }: Props) {
  const [amount, setAmount] = React.useState<number>();
  const [quote, setQuote] = React.useState<LiFiStep | null>();
  const [loading, setLoading] = React.useState(false);
  const { quote: getQuote, swap } = useTrade();
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const { close } = useModal();
  const storage = useStorage();

  const doSwap = async () => {
    if (loading || !quote) return;
    setLoading(true);

    try {
      await swap(quote);
      toast('Transaction submitted successfully!');
    } catch (e) {
      toast((e as Error).message || 'Could not send transaction');
    } finally {
      setLoading(false);
    }
  };

  const debouncedQuote = React.useMemo(() => {
    return debounce(async (amount: number) => {
      setQuote(undefined); // -- act as loader
      const response = await getQuote(
        'sell',
        coin.address,
        '0x4200000000000000000000000000000000000006',
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
    <div className="pb-5">
      <div className="flex items-center justify-between p-3.5 border-b">
        <div className="flex items-center gap-2">
          <Percent className="opacity-60 size-4" strokeWidth={2} />
          <span className="font-medium text-sm text-red-500">Sell {coin.symbol}</span>
        </div>

        <button onClick={close}>
          <X className="size-4 opacity-60" />
        </button>
      </div>

      <div className="space-y-4">
        <p className="py-4 px-3.5 -mb-3 font-medium text-[15px] flex items-center gap-2">
          <span>Total Holding:</span>
          <ArrowRight className="size-3 opacity-50" />
          <span className="border-b-[1.5px] border-dotted border-gray-400">
            {Number(toNumber(balance)).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </p>

        <div className="p-3.5 pb-0">
          <div className="bg-secondary/40 p-1.5 border rounded-lg flex items-center gap-1 relative mb-2.5">
            <span className="text-xs uppercase font-semibold w-17 text-center shrink-0">
              Amount
            </span>
            <div className="bg-background rounded-lg w-full">
              <Input
                className="w-full h-9 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                type="number"
                style={{ fontSize: '13px' }}
                value={String(amount ?? '')}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) setAmount(val);
                }}
              />
              <SmartImage
                src={coin.mediaContent.previewImage.medium}
                alt={coin.symbol}
                className="size-4.5 rounded-full"
                loaderClassName="size-4.5 rounded-full bg-secondary absolute right-4 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {storage.sellPresets.map((value) => (
              <Button
                key={value}
                className="flex-1 h-10"
                variant={'outline'}
                disabled={toNumber(balance) <= 0}
                onClick={() => setAmount((value * toNumber(balance)) / 100)}
              >
                <span className="text-[13px]">{value}%</span>
              </Button>
            ))}
          </div>
        </div>

        {quote ? (
          <div className="p-3.5 -my-2 pb-7">
            <Quote quote={quote} />
          </div>
        ) : null}

        <div className="px-3.5">
          <Button
            size={'lg'}
            className="w-full h-11"
            onClick={doSwap}
            disabled={!address || (amount || 0) > toNumber(balance) || !quote || loading}
          >
            {(typeof quote === 'undefined' && amount) || (authenticated && !address) || loading ? (
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
                : amount > toNumber(balance)
                ? 'Insufficient Funds'
                : 'Sell Token'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
