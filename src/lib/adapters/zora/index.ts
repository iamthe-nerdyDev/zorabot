import { toQueryString } from '@/lib/helpers';
import ZoraClient from './client';
import axios from 'axios';
import { ZORA_GRAPHQL_URL } from '@/lib/constants';

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
      uniswapPoolAddress: coin.node.uniswapV4PoolKey
        ? '0x498581ff718922c3f8e6a244956af099b2652b2b'
        : coin.node.uniswapV3PoolAddress,
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

  async getCoin(address: string) {
    const query = toQueryString({ address });
    const { error, data } = await this.client.getInstance().get(`/coin?${query}`);
    if (error) return null;
    // --
    const response: ZoraCoin = { node: data.zora20Token };
    return this.formatCoin(response);
  }

  async getCoins(cursor: string | null) {
    const query = toQueryString({
      after: cursor,
      listType: 'NEW',
      count: 40,
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

  async getCoinsExplore(listType: string, cursor: string | null) {
    const query = toQueryString({
      after: cursor,
      listType,
      count: 40,
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

  async getCoinMCDataPoints(coin_id: string) {
    try {
      const { data } = await axios.post(ZORA_GRAPHQL_URL, {
        hash: '9682c6e510be63021648c9eb5342c567',
        variables: {
          id: coin_id,
        },
        operationName: 'ChartQuery',
      });

      return data.data.node as ZoraChart;
    } catch {
      return null;
    }
  }

  async getCoinHolders(address: string, cursor: string | null) {
    const chainId = 8453;
    const query = toQueryString({
      address,
      chainId,
      after: cursor,
      count: 40,
    });

    const { error, data } = await this.client.getInstance().get(`/coinHolders?${query}`);
    if (error) return null;
    // --
    const response = data as {
      zora20Token: {
        tokenBalances: {
          pageInfo: {
            endCursor: string | null;
            hasNextPage: boolean;
          };
          count: number;
          edges: ZoraCoinHolder[];
        };
      };
    };

    return {
      total: response.zora20Token.tokenBalances.count,
      holders: response.zora20Token.tokenBalances.edges.map((e) => e.node),
      cursor: response.zora20Token.tokenBalances.pageInfo.endCursor,
    };
  }

  async getCoinSwaps(address: string, cursor: string | null) {
    const chainId = 8453;
    const query = toQueryString({
      address,
      chainId,
      after: cursor,
      first: 100,
    });

    const { error, data } = await this.client.getInstance().get(`/coinSwaps?${query}`);
    if (error) return null;
    // --
    const response = data as {
      zora20Token: {
        swapActivities: {
          pageInfo: {
            endCursor: string | null;
            hasNextPage: boolean;
          };
          count: number;
          edges: ZoraCoinSwap[];
        };
      };
    };

    return {
      total: response.zora20Token.swapActivities.count,
      swaps: response.zora20Token.swapActivities.edges.map((e) => e.node),
      cursor: response.zora20Token.swapActivities.pageInfo.endCursor,
    };
  }

  async getPortfolio(address: string, cursor: string | null) {
    const chainIds = [8453];
    const query = toQueryString({
      identifier: address,
      count: 100,
      chainIds,
      after: cursor,
      sortOption: 'BALANCE',
      excludeHidden: false,
    });

    const { error, data } = await this.client.getInstance().get(`/profileBalances?${query}`);
    if (error) return null;
    // --
    const response = data.profile.coinBalances as {
      pageInfo: {
        endCursor: string | null;
        hasNextPage: boolean;
      };
      count: number;
      edges: ZoraCoinBalance[];
    };

    return {
      total: response.count,
      holdings: response.edges.map((e) => ({
        ...e.node,
        coin: this.formatCoin({ node: e.node.coin }),
      })),
      cursor: response.pageInfo.endCursor,
    };
  }

  async getMultipleCoins(addresses: string[]) {
    const chainId = 8453;
    const query = toQueryString({
      coins: addresses.map((value) => ({ collectionAddress: value, chainId })),
    });

    const { error, data } = await this.client.getInstance().get(`/coins?${query}`);
    if (error) return null;
    // --
    const response = data.zora20Tokens as ZoraCoin['node'][];
    return response.map((r) => this.formatCoin({ node: r }));
  }

  async search(query: string) {
    try {
      const { data } = await axios.post(ZORA_GRAPHQL_URL, {
        hash: 'b4de1fb1e9878971ed419265e3d0f612',
        variables: {
          text: query,
        },
        operationName: 'useSearchResultsProfilesQuery',
      });

      return data.data.profileSearch as {
        edges: ZoraProfile[];
        count: number;
      };
    } catch {
      return null;
    }
  }

  async getProfile(address: string) {
    const query = toQueryString({
      identifier: address,
    });

    const { error, data } = await this.client.getInstance().get(`/profile?${query}`);
    if (error) return null;

    return data.profile as ZoraProfileAdvance;
  }

  async getProfileCoins(address: string, cursor: string | null) {
    const chainIds = [8453];
    const query = toQueryString({
      identifier: address,
      count: 100,
      after: cursor,
      chainIds,
    });

    const { error, data } = await this.client.getInstance().get(`/profileCoins?${query}`);
    if (error) return null;
    // --
    const response = data.profile.createdCoins as {
      pageInfo: {
        endCursor: string | null;
        hasNextPage: boolean;
      };
      count: number;
      edges: ZoraCoin[];
    };

    return {
      total: response.count,
      coins: response.edges.map((e) => this.formatCoin(e)),
      cursor: response.pageInfo.endCursor,
    };
  }
}

export default new Zora();
