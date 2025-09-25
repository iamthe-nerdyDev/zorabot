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
import { useAccount, useWriteContract } from 'wagmi';
import { formatNumber, toBigIntAmount, toNumber } from '@/lib/helpers';
import { Input } from '../ui/input';
import { IconTicket } from '@tabler/icons-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';

export default function MarketSharesBuy({ market }: { market: CustomPriceMarket }) {
  const [amount, setAmount] = React.useState('');
  const [choice, setChoice] = React.useState<'yes' | 'no'>('yes');
  const { authenticated, user } = usePrivy();
  const { writeContractAsync, isPending } = useWriteContract();
  const account = useAccount();

  const address = React.useMemo(
    () => (account.address || user?.wallet?.address)?.toLowerCase(),
    [account.address, user?.wallet]
  );

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
        args: [CONTRACT_ADDRESS, ethers.MaxUint256],
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

  return (
    <div className="p-3.5">
      <div className="flex items-center justify-between mb-3.5">
        <h4 className="text-lg font-semibold flex items-center gap-1.5">
          <IconTicket className="opacity-60 size-5" strokeWidth={1.5} />
          <span>Place Bet</span>
        </h4>
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={() => setChoice('yes')}
            className={`rounded-full size-7 border ${
              choice === 'yes'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-green-50 text-green-500 hover:bg-green-100'
            }`}
          >
            Y
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setChoice('no')}
            className={`rounded-full size-7 border ${
              choice === 'no'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            N
          </Button>
        </div>
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

      {!authenticated ? (
        <ConnectButton className="h-10.5 w-full" />
      ) : hasEnded ? (
        <Button className="h-10.5 w-full rounded-lg" disabled>
          Betting ended
        </Button>
      ) : (
        <Button
          className="h-10.5 w-full rounded-lg"
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
              ? 'Loading form'
              : needsApproval
              ? `Approve ${market.bettingToken.symbol}`
              : amount
              ? isNaN(Number(amount))
                ? 'Not a valid number'
                : balance && balance < Number(amount)
                ? 'Insufficient Balance'
                : `Place ${choice === 'yes' ? 'YES' : 'NO'} Bet`
              : 'Enter an amount'}
          </span>
        </Button>
      )}
    </div>
  );
}
