export const IS_PROD = process.env.NODE_ENV === 'production';
export const DEBUG = IS_PROD ? false : true;
export const ZORA_API_BASE_URL =
  process.env.ZORA_API_BASE_URL || 'https://api-sdk.zora.engineering';
export const ZORA_API_KEY = process.env.ZORA_API_KEY;
export const ZORA_GRAPHQL_URL = 'https://api.zora.co/universal/graphql';
export const RPC_URL = process.env.RPC_URL;
// -- client keys
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'df3c8746-6039-4bb3-9d07-5fec12d587a7';
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmeqz4m1i01npkz0cqljvaf2g';
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
