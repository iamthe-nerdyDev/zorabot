import { base } from 'viem/chains';

export const IS_PROD = process.env.NODE_ENV === 'production';
export const DEBUG = IS_PROD ? false : true;
export const ZORA_API_BASE_URL =
  process.env.ZORA_API_BASE_URL || 'https://api-sdk.zora.engineering';
export const ZORA_API_KEY = process.env.ZORA_API_KEY;
export const ZORA_GRAPHQL_URL = 'https://api.zora.co/universal/graphql';
export const RPC_URL = process.env.RPC_URL;
export const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || '';
export const MORALIS_SECRET_KEY = process.env.MORALIS_SECRET_KEY || '';
export const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY || '';
export const PRIVATE_KEY = (process.env.PRIVATE_KEY || '') as `0x${string}`;
// -- client keys
export const CONTRACT_CHAIN = base;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x25319a78F3AE46A13B19f10871A5eC33EdF91e39') as `0x${string}`;
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmeqz4m1i01npkz0cqljvaf2g';
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
// --
export const LIFI_INTEGRATOR = process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || 'Zorlify';
export const PROTOCOL_LOGO = 'https://zolify.xyz/farcaster/splash-transparent.png';
const NEXT_PUBLIC_SWAP_PERCENTAGE = Number(process.env.NEXT_PUBLIC_SWAP_PERCENTAGE || 1);
export const SWAP_PERCENTAGE = isNaN(NEXT_PUBLIC_SWAP_PERCENTAGE) ? 1 : NEXT_PUBLIC_SWAP_PERCENTAGE;
