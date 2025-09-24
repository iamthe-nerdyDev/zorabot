import { createPublicClient, http } from 'viem';
import { CONTRACT_CHAIN } from './constants';

export default createPublicClient({
  chain: CONTRACT_CHAIN,
  transport: http(),
});
