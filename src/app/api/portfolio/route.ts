import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const address = '0x27c225e8b8929db4473089b78613669b0dbd00e5';
  //   const address = searchParams.get('address');
  //   if (!address) {
  //     return NextResponse.json({ error: 'Address is missing in request query' }, { status: 400 });
  //   }

  const response = await zora.getPortfolio(address, cursor);
  return NextResponse.json({ data: response }, { status: 200 });
}
