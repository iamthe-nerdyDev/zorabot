'use client';

import type { CustomPriceMarket } from '@/types';
import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import ConnectButton from './ConnectButton';
import { usePrivy } from '@privy-io/react-auth';
import { abi as Erc20Abi } from '@/lib/abis/ERC20.abi.json';
import { abi } from '@/lib/abis/ZolifyPricePredictions.abi.json';
import { useQuery } from '@tanstack/react-query';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import client from '@/lib/client';
import { useWriteContract } from 'wagmi';
import { formatNumber, toBigIntAmount, toNumber } from '@/lib/helpers';
import { Input } from '../ui/input';
import { IconCheck, IconTicket, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { cn } from '@/lib/utils';
import useAddress from '@/hooks/useAddress';

export default function MarketSharesBuy({ market }: { market: CustomPriceMarket }) {
  const address = useAddress();
  const [amount, setAmount] = React.useState('');
  const [choice, setChoice] = React.useState<'yes' | 'no'>('yes');
  const { authenticated } = usePrivy();
  const { writeContractAsync, isPending } = useWriteContract();

  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isFetchingAllowance,
  } = useQuery({
    enabled: !!address,
    queryKey: ['allowance', market.bettingToken.address, address],
    queryFn: async () => {
      const response = await client.readContract({
        address: market.bettingToken.address as `0x${string}`,
        abi: Erc20Abi,
        functionName: 'allowance',
        args: [address, CONTRACT_ADDRESS],
      });

      return toNumber(response as bigint, market.bettingToken.decimals);
    },
  });

  const {
    data: balance,
    refetch: refetchBalance,
    isLoading: isFetchingBalance,
  } = useQuery({
    enabled: !!address,
    queryKey: ['balance', market.bettingToken.address, address],
    queryFn: async () => {
      const response = await client.readContract({
        address: market.bettingToken.address as `0x${string}`,
        abi: Erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      });

      return toNumber(response as bigint, market.bettingToken.decimals);
    },
  });

  const { data: feeBps, isLoading: isFetchingFee } = useQuery({
    queryKey: ['feeBps'],
    queryFn: async () => {
      const response = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'feeBps',
      });

      return Number(response);
    },
  });

  async function approve() {
    try {
      await writeContractAsync({
        address: market.bettingToken.address as `0x${string}`,
        abi: Erc20Abi,
        functionName: 'approve',
        args: [
          CONTRACT_ADDRESS,
          toBigIntAmount(Number(amount), market.bettingToken.decimals, true),
        ],
      });

      await refetchAllowance();
    } catch (e) {
      console.error(e);
      toast('Could not approve token');
    }
  }

  async function buyShares() {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'buyShares',
        args: [
          BigInt(market.onchain_id),
          choice === 'yes',
          toBigIntAmount(Number(amount), market.bettingToken.decimals),
        ],
      });

      await refetchBalance();

      toast(
        `Successfully placed a bet of ${amount} ${
          market.bettingToken.symbol
        } on ${choice.toUpperCase()}`
      );
    } catch (e) {
      console.error(e);
      toast('Could not place bet');
    }
  }

  const isLoading = isPending || isFetchingFee || isFetchingAllowance || isFetchingBalance;
  const hasEnded = new Date().getTime() > new Date(market.endTs).getTime();
  const needsApproval =
    allowance !== undefined && (allowance === 0 || allowance < toNumber(amount));

  const fee = formatNumber(feeBps && amount ? (Number(amount) * feeBps) / 10000 : 0, false);
  //   const net = amount ? Number(amount) - fee : 0;

  const err = isNaN(Number(amount))
    ? 'Not a valid number'
    : balance && balance < Number(amount)
    ? `Insufficient ${market.bettingToken.symbol} Balance`
    : null;

  return hasEnded ? null : (
    <div className="p-3.5 border rounded-lg mb-3">
      <div className="flex items-center justify-between mb-3.5">
        <h4 className="text-lg font-semibold flex items-center gap-1.5">
          <IconTicket className="opacity-60 size-5" strokeWidth={1.5} />
          <span>Place Bet</span>
        </h4>
      </div>

      <div className="flex gap-1.5 mb-4">
        <Button
          type="button"
          onClick={() => setChoice('yes')}
          className={`h-10.5 flex-1 bg-green-500 text-white hover:bg-green-600 ${
            choice === 'yes' ? 'opacity-100' : 'bg-green-300 opacity-50'
          }`}
        >
          <span>Yes</span>
          <IconCheck strokeWidth={2.5} />
        </Button>

        <Button
          type="button"
          onClick={() => setChoice('no')}
          className={`h-10.5 flex-1 bg-red-500 text-white hover:bg-red-600 ${
            choice === 'no' ? 'opacity-100' : 'bg-red-300 opacity-50'
          }`}
        >
          <span>No</span>
          <IconX strokeWidth={2.5} />
        </Button>
      </div>

      <div className="mb-3">
        <label htmlFor="amount" className="block mb-1.5 w-fit">
          Amount
        </label>
        <div className="relative">
          <Input
            name="amount"
            id="amount"
            type="number"
            step={1}
            placeholder="Eg. 65"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-10 px-4 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            min={0}
          />
          <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-medium">
            {market.bettingToken.symbol}
          </span>
        </div>

        {balance || feeBps ? (
          <div className="mt-2 flex items-center justify-between">
            <div>
              {feeBps ? (
                <p className="text-xs text-gray-300 font-medium">
                  Fee ({(feeBps * 100) / 10000}%) ≈ {fee} {market.bettingToken.symbol}
                </p>
              ) : null}
            </div>

            {balance ? (
              <div className="flex items-center gap-1.5">
                <button
                  className="text-xs px-2.5 font-semibold py-1 rounded-md border"
                  onClick={() => setAmount(String(0.5 * balance))}
                >
                  50%
                </button>
                <button
                  className="text-xs px-2.5 font-semibold py-1 rounded-md border"
                  onClick={() => setAmount(String(balance))}
                >
                  MAX
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {err ? <p className="text-red-500 text-sm font-medium mb-2.5">{err}</p> : null}

      {!authenticated ? (
        <ConnectButton className="h-10.5 w-full" />
      ) : (
        <Button
          className={cn(
            'h-10.5 w-full rounded-lg',
            !needsApproval &&
              !isLoading &&
              (choice === 'yes' ? 'bg-green-600 text-white' : 'bg-red-600 text-white')
          )}
          disabled={
            isLoading || !amount || isNaN(Number(amount)) || (balance || 0) < Number(amount)
          }
          onClick={needsApproval ? approve : buyShares}
        >
          {isLoading ? (
            <Loader2 className="size-3.5 opacity-60 animate-spin" strokeWidth={2.5} />
          ) : null}
          <span>
            {isLoading
              ? 'Loading'
              : needsApproval
              ? `Approve ${market.bettingToken.symbol}`
              : `Place ${choice === 'yes' ? 'YES' : 'NO'} Bet`}
          </span>
        </Button>
      )}
    </div>
  );
}
