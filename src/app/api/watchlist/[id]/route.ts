import prisma from '@/lib/adapters/prisma';
import zora from '@/lib/adapters/zora';
import { validateZodSchema } from '@/lib/helpers';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

// -- get wishlist & items
export async function GET(req: NextRequest, { params }: any) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const watchlist = await prisma.watchlist.findFirst({
    where: { id, userId: identifier },
    include: { items: true, alerts: true },
  });

  if (!watchlist) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const addresses = watchlist.items.map((item) => item.coinAddress);
  const coins = await zora.getMultipleCoins(addresses);
  const output = {
    ...watchlist,
    items: watchlist.items.map((item) => ({
      ...item,
      coin: coins?.find((c) => c.address === item.coinAddress),
    })),
  };

  return NextResponse.json({ data: output });
}

// -- add wishlist item
export async function POST(req: NextRequest, { params }: any) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const Schema = z.object({
    coinAddress: z.string().min(1, 'coinAddress cannot be empty'),
  });

  const { error, data } = validateZodSchema<z.infer<typeof Schema>>(Schema, body);
  if (error || !data) {
    return NextResponse.json({ error: error ?? 'Could not complete request!' }, { status: 400 });
  }

  await prisma.watchlistItem.create({
    data: {
      watchlistId: id,
      coinAddress: data.coinAddress,
    },
  });

  return NextResponse.json({ data: true });
}

// -- delete wishlist
export async function DELETE(req: NextRequest, { params }: any) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.watchlist.delete({
    where: {
      userId: identifier,
      id,
    },
  });

  return NextResponse.json({ data: true });
}
