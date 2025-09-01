import prisma from '@/lib/adapters/prisma';
import { IS_PROD } from '@/lib/constants';
import { Errors, createClient } from '@farcaster/quick-auth';
import { validateZodSchema } from '@/lib/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import z from 'zod';
import session from '@/lib/adapters/session';

const client = createClient();

// -- SIWE
export async function POST(req: NextRequest) {
  const body = await req.json();
  const Schema = z.object({
    message: z.any(),
    signature: z.string().min(1, 'signature cannot be empty'),
  });

  const { error, data } = validateZodSchema<z.infer<typeof Schema>>(Schema, body);
  if (error || !data) {
    return NextResponse.json({ error: error ?? 'Could not complete request!' }, { status: 400 });
  }

  const siweMessage = new SiweMessage(data.message);
  const siwe = await siweMessage.verify({ signature: data.signature });
  if (siwe.error) {
    return NextResponse.json({ error: siwe.error }, { status: 400 });
  }

  const s = await session();
  if (siwe.data.nonce !== s.nonce) {
    return NextResponse.json({ error: 'Invalid nonce!' }, { status: 422 });
  }

  s.destroy();
  const user = await prisma.user.upsert({
    where: { address: siwe.data.address },
    create: { address: siwe.data.address },
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

// -- adding fid
export async function GET(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authorization = req.headers.get('Authorization')?.replace(/^Bearer\s/, '');
  if (!authorization) {
    return NextResponse.json({ error: 'Missing farcaster auth token' }, { status: 400 });
  }

  try {
    const payload = await client.verifyJwt({
      token: authorization,
      domain: new URL(req.url).hostname,
    });

    const fid = payload.sub.toString();
    await prisma.user.update({ where: { id: identifier }, data: { fid } });

    NextResponse.json({ data: true });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // --
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
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
