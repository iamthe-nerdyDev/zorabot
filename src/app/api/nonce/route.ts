import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import session from '@/lib/adapters/session';

export async function GET(_req: NextRequest) {
  const nonce = generateNonce();
  const s = await session();
  // --
  s.nonce = nonce;
  await s.save();

  return NextResponse.json({
    data: {
      nonce,
    },
  });
}
