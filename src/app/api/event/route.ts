import prisma from '@/lib/adapters/prisma';
import {
  CONTRACT_ADDRESS,
  CONTRACT_CHAIN,
  CRONJOB_API_KEY,
  PRIVATE_KEY,
  RPC_URL,
} from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { writeContract } from 'viem/actions';
import { abi } from '@/lib/abis/ZolifyPricePredictions.abi.json';

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log(body);

  const secret = req.headers.get('x-secret');
  if (!secret) return NextResponse.json('Bad Input', { status: 400 });
  if (secret !== CRONJOB_API_KEY) return NextResponse.json('Unauthorized', { status: 401 });

  const { marketId } = body;
  const market = await prisma.priceMarket.findFirst({ where: { id: marketId } });
  console.log(market);
  if (market && !market.resolved) {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: CONTRACT_CHAIN,
      transport: http(RPC_URL),
    });

    const tx = await writeContract(walletClient, {
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'resolveMarket',
      args: [market.onchain_id],
    });

    console.dir(tx);
  }

  return NextResponse.json('Ok');
}
