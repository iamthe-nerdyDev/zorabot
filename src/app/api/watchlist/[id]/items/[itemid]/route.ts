import prisma from '@/lib/adapters/prisma';
import { NextRequest, NextResponse } from 'next/server';

// -- delete wishlist item
export async function DELETE(req: NextRequest, { params }: any) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, itemid } = await params;
  await prisma.watchlistItem.delete({
    where: {
      id: itemid,
      watchlistId: id,
    },
  });

  return NextResponse.json({ data: true });
}
