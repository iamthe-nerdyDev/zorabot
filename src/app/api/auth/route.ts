import { NextRequest, NextResponse } from 'next/server';
import privy from '@/lib/adapters/privy';
import prisma from '@/lib/adapters/prisma';
import { IS_PROD } from '@/lib/constants';
import { User } from '@privy-io/server-auth';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s/, '');
  if (!token) {
    return NextResponse.json({ error: 'Authorization token is missing!' }, { status: 401 });
  }

  const body: User = (await req.json()).user;
  if (!body.wallet) {
    return NextResponse.json({ error: 'No wallet linked yet!' }, { status: 400 });
  }

  await privy.verifyAuthToken(token).catch((e) => {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  });

  const user = await prisma.user.upsert({
    where: { address: body.wallet.address },
    create: {
      address: body.wallet.address,
      fid: body.farcaster?.fid.toString(),
      metadata: JSON.stringify(body),
    },
    update: {},
  });

  const response = NextResponse.json({ data: user });
  // --
  response.cookies.set('identifier', user.id, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}

// -- logout
export async function DELETE(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = req.cookies.delete('identifier');
  return NextResponse.json({ data });
}
