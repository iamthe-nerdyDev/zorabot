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
