type ZoraMedia = {
  mimeType?: string;
  originalUri?: string;
  previewImage: {
    small: string;
    medium: string;
    blurhash: string | null;
  };
};

type ZoraSocialAccount = null | {
  username: string;
  displayName: string;
  id: string | null;
};

type ZoraCoin = {
  node: {
    __typename: string;
    id: string;
    name: string;
    description: string;
    address: string;
    symbol: string;
    totalSupply: string;
    totalVolume: string;
    volume24h: string;
    createdAt: string;
    creatorAddress: string;
    poolCurrencyToken: {
      address: string;
      name: string;
      decimals: number;
    };
    tokenPrice: {
      priceInUsdc: string;
      currencyAddress: string;
      priceInPoolToken: string;
    };
    marketCap: string;
    marketCapDelta24h: string;
    chainId: number;
    tokenUri: string;
    platformReferrerAddress: string;
    payoutRecipientAddress: string;
    creatorProfile: {
      __typename: string;
      id: string;
      handle: string;
      avatar: ZoraMedia;
      socialAccounts: {
        instagram: ZoraSocialAccount;
        tiktok: ZoraSocialAccount;
        twitter: ZoraSocialAccount;
        farcaster: ZoraSocialAccount;
      };
      creatorCoin: {
        address: string;
      };
    };
    mediaContent: ZoraMedia;
    uniqueHolders: number;
    uniswapV4PoolKey: {
      token0Address: string;
      token1Address: string;
      fee: string;
      tickSpacing: string;
      hookAddress: string;
    };
  };
  cursor?: string;
};

type ZoraChartPoints = {
  timestamp: '2025-08-03T18:12:00';
  closePrice: '0.000003334717456479119082706038920323780';
};

type ZoraChart = {
  __typename: string;
  __isIGraphQLZora20Token: string;
  id: string;
  oneHour: ZoraChartPoints[];
  oneDay: ZoraChartPoints[];
  oneWeek: ZoraChartPoints[];
  oneMonth: ZoraChartPoints[];
  all: ZoraChartPoints[];
};
