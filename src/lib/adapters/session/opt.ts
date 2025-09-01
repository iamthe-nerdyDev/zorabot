import { IS_PROD, SESSION_PASSWORD } from '@/lib/constants';
import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'siwe',
  cookieOptions: {
    secure: IS_PROD,
  },
};
