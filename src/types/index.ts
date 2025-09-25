import type { Claim, PriceMarket, Shares, Token, User } from '@/generated/prisma';

export type CustomPriceMarket = PriceMarket & {
  token: Token;
  bettingToken: Token;
  creator: User;
  shares?: Shares[];
  claims?: Claim[] | null;
};
