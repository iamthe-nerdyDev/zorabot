import SmartImage from '@/components/global/SmartImage';
import { formatNumber, toNumber } from '@/lib/helpers';
import { type LiFiStep } from '@lifi/sdk';
import { EqualApproximately } from 'lucide-react';

export default function Quote({ quote }: { quote: LiFiStep }) {
  return (
    <div className="space-y-2.5">
      <div className="border bg-secondary/50 p-3 rounded-lg flex items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <SmartImage
            src={quote.action.fromToken.logoURI}
            alt={quote.action.fromToken.symbol}
            className="size-8 rounded-full"
            loaderClassName="size-8 rounded-full bg-secondary shrink-0"
          />
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-[1px] truncate w-full max-w-30">
              {formatNumber(toNumber(quote.estimate.fromAmount, quote.action.fromToken.decimals))}
              &nbsp;
              {quote.action.fromToken.symbol}
            </p>
            <p className="font-semibold text-xs">
              $
              {toNumber(quote.estimate.fromAmountUSD || '0').toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            </p>
          </div>
        </div>

        <EqualApproximately className="size-4.5 opacity-60" />

        <div className="flex items-center gap-2">
          <SmartImage
            src={quote.action.toToken.logoURI}
            alt={quote.action.toToken.symbol}
            className="size-8 rounded-full"
            loaderClassName="size-8 rounded-full bg-secondary shrink-0"
          />
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-[1px] truncate w-full max-w-30">
              {formatNumber(toNumber(quote.estimate.toAmount, quote.action.toToken.decimals))}
              &nbsp;
              {quote.action.toToken.symbol}
            </p>
            <p className="font-semibold text-xs">
              $
              {toNumber(quote.estimate.toAmountUSD || '0').toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="border bg-secondary/30 px-3 py-4 rounded-lg text-center">
        <p className="font-medium uppercase text-[11px] mb-1 text-muted-foreground">
          Minimum Amount Received
        </p>
        <p className="font-medium text-xs flex items-center justify-center gap-1">
          <span>
            {toNumber(quote.estimate.toAmountMin, quote.action.toToken.decimals).toLocaleString()}
          </span>
          <span className="text-muted-foreground w-full truncate max-w-10">
            {quote.action.toToken.symbol}
          </span>
        </p>
      </div>
    </div>
  );
}
