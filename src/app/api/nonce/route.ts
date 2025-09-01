import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';

export async function GET(_req: NextRequest) {
  const nonce = generateNonce();
  return NextResponse.json({ data: { nonce } });
}
