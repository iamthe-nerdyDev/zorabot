import prisma from '@/lib/adapters/prisma';
import { NextRequest, NextResponse } from 'next/server';

// -- enable an alert
export async function PUT(req: NextRequest, { params }: any) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const alert = await prisma.alert.update({
    where: {
      id,
      userId: identifier,
    },
    data: {
      status: 'ENABLED',
      createdAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ data: alert });
}

// -- delete an alert
export async function DELETE(req: NextRequest, { params }: any) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.alert.delete({
    where: {
      id,
      userId: identifier,
    },
  });

  return NextResponse.json({ data: true });
}
