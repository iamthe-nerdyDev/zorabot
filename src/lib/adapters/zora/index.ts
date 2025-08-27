import { toQueryString } from '@/lib/helpers';
import ZoraClient from './client';

class Zora {
  constructor(private client = new ZoraClient()) {}

  private formatCoin(coin: ZoraCoin): Coin {
    return {
      id: coin.node.id,
      name: coin.node.name,
      symbol: coin.node.symbol,
      description: coin.node.description,
      address: coin.node.address,
      created_at: coin.node.createdAt,
      totalSupply: coin.node.totalSupply,
      totalVolume: coin.node.totalVolume,
      volume24h: coin.node.volume24h,
      poolToken: coin.node.poolCurrencyToken,
      price: {
        priceInPoolToken: coin.node.tokenPrice.priceInPoolToken,
        priceInUsdc: coin.node.tokenPrice.priceInUsdc,
      },
      marketCap: coin.node.marketCap,
      marketCapDelta24h: coin.node.marketCapDelta24h,
      uniqueHolders: coin.node.uniqueHolders,
      isCreatorToken: coin.node.address === coin.node.creatorProfile.creatorCoin?.address,
      mediaContent: coin.node.mediaContent,
      creator: {
        id: coin.node.creatorProfile.id,
        avatar: coin.node.creatorProfile.avatar,
        address: coin.node.creatorAddress,
        handle: coin.node.creatorProfile.handle,
        creatorToken: {
          address: coin.node.creatorProfile.creatorCoin?.address,
        },
      },
    };
  }

  async getCoins(cursor: string | null) {
    const query = toQueryString({
      after: cursor,
      listType: 'NEW',
      count: 20,
    });

    const { error, data } = await this.client.getInstance().get(`/explore?${query}`);
    if (error) return null;
    // --
    const response = data as {
      exploreList: {
        edges: ZoraCoin[];
        pageInfo: {
          endCursor: string | null;
          hasNextPage: true;
        };
      };
    };

    const coins = response.exploreList.edges.map((e) => this.formatCoin(e));
    return {
      coins,
      cursor: response.exploreList.pageInfo.endCursor,
    };
  }
}

export default new Zora();
