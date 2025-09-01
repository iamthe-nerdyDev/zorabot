type Creator = {
  id: string;
  avatar: ZoraMedia;
  handle: string;
  address: string;
  creatorToken: {
    address: string;
  };
};

type Coin = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  address: string;
  created_at: string;
  totalSupply: string;
  totalVolume: string;
  volume24h: string;
  uniswapPoolAddress?: string;
  price: {
    priceInUsdc: string;
    priceInPoolToken: string;
  };
  poolToken: {
    address: string;
    name: string;
    decimals: number;
  };
  marketCap: string;
  marketCapDelta24h: string;
  uniqueHolders: number;
  isCreatorToken: boolean;
  mediaContent: ZoraMedia;
  creator: Creator;
};

type Filters = {
  creatorIds?: string[];
  isCreatorToken?: boolean;
  isContentToken?: boolean;
  totalVolume?: {
    min?: number;
    max?: number;
  };
  volume24h?: {
    min?: number;
    max?: number;
  };
  marketCap?: {
    min?: number;
    max?: number;
  };
  uniqueHolders?: {
    min?: number;
    max?: number;
  };
};

type CoinHolder = {
  balance: string;
  ownerAddress: string;
  ownerProfile: {
    __typename: string;
    id: string;
    handle: string;
    avatar: ZoraMedia | null;
  };
};

type CoinSwap = {
  id: string;
  currencyAmountWithPrice: {
    priceUsdc: string;
    currencyAmount: {
      currencyAddress: string;
      amountDecimal: number;
    };
  };
  senderAddress: string;
  recipientAddress: string;
  transactionHash: string;
  coinAmount: string;
  blockTimestamp: string;
  activityType: 'BUY' | 'SELL';
  senderProfile: {
    __typename: string;
    id: string;
    handle: string;
    avatar: ZoraMedia | null;
  };
  __typename: string;
};

type TokenType = 'native' | string;
