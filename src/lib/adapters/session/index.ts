import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from './opt';

export default async function () {
  return await getIronSession<SessionData>(await cookies(), sessionOptions);
}
