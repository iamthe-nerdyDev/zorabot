import { ethers, toNumber } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { abi } from '@/lib/abis/ZolifyPricePredictions.abi.json';
import { abi as Erc20ABI } from '@/lib/abis/ERC20.abi.json';
import prisma from '@/lib/adapters/prisma';
import { MarketOutcome } from '@/generated/prisma';
import { CONTRACT_ADDRESS, MORALIS_SECRET_KEY } from '@/lib/constants';
import Moralis from 'moralis';
import { createEvent } from '@/lib/helpers';
import client from '@/lib/client';

Moralis.start({ streamsSecret: MORALIS_SECRET_KEY });

export function decodeEvent(log: any) {
  const iface = new ethers.Interface(abi);

  try {
    const parsedLog = iface.parseLog({
      data: log.data,
      topics: [log.topic0, log.topic1, log.topic2, log.topic3].filter(Boolean),
    });

    if (parsedLog) {
      return {
        name: parsedLog.name,
        args: parsedLog.args,
      };
    }
  } catch (e) {
    console.error('Failed to decode log:', e);
  }

  return null;
}

function getOutcome(outcome: bigint | number) {
  return toNumber(outcome) === 0
    ? MarketOutcome.UNRESOLVED
    : toNumber(outcome) === 1
    ? MarketOutcome.YES
    : MarketOutcome.NO;
}

async function upsertToken(tokenAddress: `0x${string}`) {
  try {
    const [name, symbol, decimals] = await Promise.all<[Promise<any>, Promise<any>, Promise<any>]>([
      client.readContract({ address: tokenAddress, abi: Erc20ABI, functionName: 'name' }),
      client.readContract({ address: tokenAddress, abi: Erc20ABI, functionName: 'symbol' }),
      client.readContract({ address: tokenAddress, abi: Erc20ABI, functionName: 'decimals' }),
    ]);

    return await prisma.token.upsert({
      where: { address: tokenAddress },
      update: {
        name,
        symbol,
        decimals: toNumber(decimals),
      },
      create: {
        address: tokenAddress,
        name,
        symbol,
        decimals: toNumber(decimals),
        description: '',
        icon: '',
      },
    });
  } catch {
    return await prisma.token.upsert({
      where: { address: tokenAddress },
      update: {
        name: 'Unknown Token',
        symbol: 'UNT',
        decimals: 16,
      },
      create: {
        address: tokenAddress,
        name: 'Unknown Token',
        symbol: 'UNT',
        decimals: 16,
        description: '',
        icon: '',
      },
    });
  }
}

async function upsertMarket(marketId: bigint, update: any = {}) {
  const onchainMarket = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'markets',
    args: [marketId],
  });

  const [
    tokenAddress,
    creatorAddress,
    bettingTokenAddress,
    targetPrice,
    targetIsAboveTargetPrice,
    outcome,
    endTs,
    _requestId,
    totalYesShares,
    totalNoShares,
    resolved,
  ] = onchainMarket as any[];

  const [token, bettingToken, creator] = await Promise.all([
    upsertToken(tokenAddress),
    upsertToken(bettingTokenAddress),
    upsertUser(creatorAddress),
  ]);

  const market = await prisma.priceMarket.upsert({
    where: { onchain_id: toNumber(marketId) },
    update: {
      ...update,
      outcome: getOutcome(outcome),
      totalYesShares: String(totalYesShares),
      totalNoShares: String(totalNoShares),
      resolved,
    },
    create: {
      onchain_id: toNumber(marketId),
      tokenAddress: token.address,
      creatorAddress: creator.address,
      bettingTokenAddress: bettingToken.address,
      targetPrice: String(targetPrice),
      targetIsAboveTargetPrice,
      outcome: getOutcome(outcome),
      endTs: new Date(toNumber(endTs) * 1000),
      totalYesShares: String(totalYesShares),
      totalNoShares: String(totalNoShares),
      resolved,
    },
  });

  return market;
}

async function upsertUser(address: string) {
  return await prisma.user.upsert({
    where: { address },
    create: { address },
    update: {},
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-signature');
  if (!signature) return NextResponse.json('Bad Input', { status: 400 });

  const isSignatureValid = Moralis.Streams.verifySignature({
    body,
    signature,
  });

  if (!isSignatureValid) return NextResponse.json('Unauthorized', { status: 401 });

  const log = body.logs[0];
  if (!log) return NextResponse.json('Ok'); // -- testing webhook

  const response = decodeEvent(log);
  console.log(response);
  if (response) {
    const { name, args } = response;

    if (name == 'Claimed') {
      const [marketId, usr, amount] = args;
      const [market, user] = await Promise.all([upsertMarket(marketId), upsertUser(usr)]);
      // --
      await prisma.claim.upsert({
        update: {},
        where: {
          marketId_userAddress: {
            marketId: market.id,
            userAddress: user.address,
          },
        },
        create: {
          marketId: market.id,
          userAddress: user.address,
          amount: String(amount),
        },
      });
    }

    if (name == 'SharesPurchased') {
      const [marketId, usr, isYes, amount, fee] = args;
      const [market, user] = await Promise.all([upsertMarket(marketId), upsertUser(usr)]);
      // --
      await prisma.shares.create({
        data: {
          marketId: market.id,
          userAddress: user.address,
          amount: String(amount),
          isYes,
          feeAmount: String(fee),
        },
      });
    }

    if (name == 'MarketCreated') {
      const [marketId] = args;
      const market = await upsertMarket(marketId);
      // --
      await createEvent(market.endTs, market.id, {
        marketId: market.id,
      });
    }

    if (name == 'MarketResolved') {
      const [marketId, outcome] = args;
      await upsertMarket(marketId, { outcome: getOutcome(outcome) });
    }

    if (name == 'RoleGranted' || name == 'RoleRevoked') {
      const CREATOR_ROLE = '0x828634d95e775031b9ff576b159a8509d3053581a8c9c4d7d86899e0afcd882f';
      const [role, usr, actor] = args;
      // --
      if (role === CREATOR_ROLE) {
        if (name == 'RoleGranted')
          await prisma.creator.create({ data: { address: usr, admin: actor } });
        if (name == 'RoleRevoked') await prisma.creator.delete({ where: { address: usr } });
      }
    }
  }

  return NextResponse.json('Ok');
}
