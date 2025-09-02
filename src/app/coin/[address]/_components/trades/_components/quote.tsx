import SmartImage from '@/components/global/SmartImage';
import { formatNumber, toNumber } from '@/lib/helpers';
import type { LiFiStep } from '@lifi/sdk';
import { ArrowUpDown } from 'lucide-react';

export default function Quote({ quote }: { quote: LiFiStep }) {
  return (
    <div className="space-y-2.5">
      <div className="border bg-secondary/50 p-3 rounded-lg flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <SmartImage
            src={quote.action.fromToken.logoURI}
            alt={quote.action.fromToken.symbol}
            className="size-8 rounded-full"
            loaderClassName="size-8 rounded-full bg-secondary shrink-0"
          />
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-[1px]">
              {formatNumber(toNumber(quote.estimate.fromAmount, quote.action.fromToken.decimals))}
              &nbsp;
              {quote.action.fromToken.symbol}
            </p>
            <p className="font-semibold text-xs">
              $
              {toNumber(quote.estimate.fromAmountUSD || '0', 0).toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            </p>
          </div>
        </div>

        <ArrowUpDown className="size-4.5 opacity-60" />

        <div className="flex items-center gap-2">
          <SmartImage
            src={quote.action.toToken.logoURI}
            alt={quote.action.toToken.symbol}
            className="size-8 rounded-full"
            loaderClassName="size-8 rounded-full bg-secondary shrink-0"
          />
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-[1px]">
              {formatNumber(toNumber(quote.estimate.toAmount, quote.action.toToken.decimals))}
              &nbsp;
              {quote.action.toToken.symbol}
            </p>
            <p className="font-semibold text-xs">
              $
              {toNumber(quote.estimate.toAmountUSD || '0', 0).toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
