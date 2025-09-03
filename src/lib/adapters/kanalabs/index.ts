import { DEBUG } from '@/lib/constants';
import { HttpClient } from '@/lib/http.util';
import type { AxiosError, AxiosResponse } from 'axios';

type KanalabsQuoteParams = {
  inputToken: string;
  outputToken: string;
  amountIn: string;
  chain?: 7;
  slippage: number;
  integrator?: string;
  integratorFeePercentage?: number;
  isFeeReferrer?: boolean;
};

export type KanalabsQuote = {
  chainId: number;
  sourceToken: string;
  targetToken: string;
  amountIn: string;
  amountOut: string;
  finalAmountOut: string;
  finalAmountOutMin: string;
  amountOutWithSlippage: string;
  steps: number;
  stepTokens: string[];
  stepAmounts: string[];
  provider: string;
  protocols: string[];
  slippage: number;
  route: {
    status: 'Success' | 'NoWay';
    tokens?: { address: string; symbol: string; name: string; decimals: number }[];
    tokenFrom: 0 | 1;
    tokenTo: 0 | 1;
    swapPrice: number;
    priceImpact: number;
    amountIn: string;
    assumedAmountOut: string;
    gasSpent: 77000;
  };
  estimatedGas: number;
  integratorFee: number;
  kanaFee: number;
  maximumGasFee: string;
  sourceTokenInUSD: string;
  targetTokenInUSD: string;
  sourceTokenPrice: number;
  targetTokenPrice: number;
  priceImpact: number;
};

type KanalabsSwapInstruction = {
  from: string;
  data: string;
  to: string;
  value: string;
  gasPrice: string;
  chainId: number;
};

class KanalabsClient extends HttpClient {
  constructor() {
    super({
      baseURL: 'https://ag.kanalabs.io/v1',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': 'zoracore',
      },
    });
  }

  _handleResponse({ data }: AxiosResponse<any>) {
    if (DEBUG) console.dir(data, { depth: null });
    return { error: false, data };
  }

  _handleError(error: AxiosError<any>) {
    if (DEBUG) console.dir(error.toJSON(), { depth: null });
    if (error.response) {
      const { data } = error.response;
      if (data) {
        return {
          error: true,
          message: data.message,
          data,
        };
      }
    }

    return { error: true, message: error.message };
  }

  getInstance() {
    return this.instance;
  }
}

class Kanalabs {
  constructor(private instance = new KanalabsClient().getInstance()) {}

  async quote(params: KanalabsQuoteParams) {
    params.chain = params.chain ?? 7;
    params.integrator = params.integrator ?? '0x6f780022bBB4310832883CFAaAB805F17f67A729';
    params.isFeeReferrer = params.isFeeReferrer ?? true;

    const { error, data } = await this.instance.get('/swapQuote', { params });
    if (error) return null;
    // --
    if (data.status === 'success') return data.data as KanalabsQuote[];
    return null;
  }

  async swapInstrutions(address: string, quote: KanalabsQuote) {
    const { error, data } = await this.instance.post('/swapInstruction', { address, quote });
    if (error) return null;
    // --
    if (data.status === 'success') {
      return data.data as {
        approveIX?: KanalabsSwapInstruction;
        swapIX: KanalabsSwapInstruction;
      };
    }
    return null;
  }
}

export default new Kanalabs();
