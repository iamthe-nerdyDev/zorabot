import { NextRequest, NextResponse } from 'next/server';
import { type TradeParameters, createTradeCall } from '@zoralabs/coins-sdk';
import { ZORA_API_BASE_URL } from '@/lib/constants';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export async function GET(req: NextRequest, { params }: any) {
  const { address } = await params;
  // --
  const payload: TradeParameters = {
    buy: {
      type: 'erc20',
      address: USDC,
    },
    sell: {
      type: 'erc20',
      address,
    },
    amountIn: BigInt(1 * 10 ** 18),
    slippage: 0,
    sender: '0x000000000000000000000000000000000000dEaD',
  };

  const resp = await createTradeCall(payload);
  return NextResponse.json({
    usdc_price: resp.quote.amountOut,
    source: {
      type: 'http',
      method: 'POST',
      url: `${ZORA_API_BASE_URL}/quote`,
      body: payload,
      response: resp,
    },
  });
}
