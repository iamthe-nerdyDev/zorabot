import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/adapters/prisma';

export async function GET(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findFirst({ where: { id: identifier } });
  return NextResponse.json({ data: user });
}
