import { base } from 'wagmi/chains';
import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { baseAccount } from 'wagmi/connectors';
import { type Chain, createClient } from 'viem';

export const connectors = [baseAccount({ appName: 'Zolify' })];
export const chains: [Chain, ...Chain[]] = [base];

export const wagmiConfig = createConfig({
  chains: chains as readonly [Chain, ...Chain[]],
  ssr: true,
  connectors,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
