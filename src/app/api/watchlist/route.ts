import prisma from '@/lib/adapters/prisma';
import { validateZodSchema } from '@/lib/helpers';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

// -- create new list
export async function POST(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const Schema = z.object({
    name: z.string().min(1, 'Name cannot be empty'),
  });

  const { error, data } = validateZodSchema<z.infer<typeof Schema>>(Schema, body);
  if (error || !data) {
    return NextResponse.json({ error: error ?? 'Could not complete request!' }, { status: 400 });
  }

  const waitlist = await prisma.watchlist.create({
    data: {
      name: data.name,
      userId: identifier,
    },
  });
  return NextResponse.json({ data: waitlist }, { status: 201 });
}

// -- get all lists
export async function GET(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const waitlists = await prisma.watchlist.findMany({ where: { userId: identifier } });
  return NextResponse.json({ data: waitlists });
}
