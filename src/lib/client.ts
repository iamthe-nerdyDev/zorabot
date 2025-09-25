import { createPublicClient, http } from 'viem';
import { CONTRACT_CHAIN, RPC_URL } from './constants';

export default createPublicClient({
  chain: CONTRACT_CHAIN,
  transport: http(RPC_URL),
});
