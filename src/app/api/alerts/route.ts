import prisma from '@/lib/adapters/prisma';
import { validateZodSchema } from '@/lib/helpers';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

// -- create an alert
export async function POST(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const Schema = z
    .object({
      watchlistId: z.string().optional(),
      coinAddress: z.string().optional(),
      note: z.string().optional(),
      condition: z.object({}),
    })
    .refine((data) => !!data.watchlistId || !!data.coinAddress, {
      message: 'Either watchlistId or coinAddress is required.',
    });

  const { error, data } = validateZodSchema<z.infer<typeof Schema>>(Schema, body);
  if (error || !data) {
    return NextResponse.json({ error: error ?? 'Could not complete request!' }, { status: 400 });
  }

  const alert = await prisma.alert.create({
    data: {
      userId: identifier,
      condition: data.condition,
      watchlistId: data.watchlistId,
      coinAddress: data.coinAddress,
      note: data.note,
    },
  });

  return NextResponse.json({ data: alert }, { status: 201 });
}
