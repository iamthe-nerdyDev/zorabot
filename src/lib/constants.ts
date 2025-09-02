export const IS_PROD = process.env.NODE_ENV === 'production';
export const DEBUG = IS_PROD ? false : true;
export const ZORA_API_BASE_URL =
  process.env.ZORA_API_BASE_URL || 'https://api-sdk.zora.engineering';
export const ZORA_API_KEY = process.env.ZORA_API_KEY;
export const ZORA_GRAPHQL_URL = 'https://api.zora.co/universal/graphql';
export const RPC_URL = process.env.RPC_URL;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || '';
// -- client keys
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmeqz4m1i01npkz0cqljvaf2g';
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
// --
const NEXT_PUBLIC_BUY_PERCENTAGE = Number(process.env.NEXT_PUBLIC_BUY_PERCENTAGE || 1);
export const BUY_PERCENTAGE = isNaN(NEXT_PUBLIC_BUY_PERCENTAGE) ? 1 : NEXT_PUBLIC_BUY_PERCENTAGE;
// --
const NEXT_PUBLIC_SELL_PERCENTAGE = Number(process.env.NEXT_PUBLIC_SELL_PERCENTAGE || 1);
export const SELL_PERCENTAGE = isNaN(NEXT_PUBLIC_SELL_PERCENTAGE) ? 1 : NEXT_PUBLIC_SELL_PERCENTAGE;
