import { ZodObject, ZodError } from 'zod';
import qs from 'querystring';
import { toast } from 'sonner';
import { formatEther, formatUnits } from 'viem';
import { ChainId, ChainType, type WidgetConfig } from '@lifi/widget';
import { BASE_URL, CRONJOB_API_KEY, LIFI_INTEGRATOR, PROTOCOL_LOGO } from './constants';
import type { CustomPriceMarket } from '@/types';
import { abi as Erc20_Abi } from '@/lib/abis/ERC20.abi.json';
import client from './client';

export function getImageURL(seed: string) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
}

export function utcString(date: Date) {
  const text = date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  return text.replace(',', '');
}

export function buildQuestion(market: CustomPriceMarket) {
  return `${market.token.name} ${market.targetIsAboveTargetPrice ? 'above' : 'below'} $${toNumber(
    market.targetPrice,
    6
  )} on ${utcString(new Date(market.endTs))} UTC?`;
}

export function toQueryString(obj?: Record<string, any>) {
  if (!obj) return '';

  const query = Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  );

  return qs.stringify(query);
}

export function getPercentChange(a: number, delta: number): number {
  const oldPrice = a - delta;
  if (oldPrice <= 0) return 0;
  return (delta / oldPrice) * 100;
}

export function formatNumber(number?: number | null, shrink = true) {
  if (!number || number == 0) return '0';

  const num = Math.abs(number);
  if (num >= 1_000_000_000_000) return (number / 1_000_000_000_000).toFixed(2) + 'T';
  if (num >= 1_000_000_000) return (number / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (number / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (number / 1_000).toFixed(2) + 'K';

  if (num >= 0.001) {
    // return number.toFixed(3).replace(/\.?0+$/, '');
  }

  if (shrink && num < 0.001) return '<0.001';

  let decimalPlaces = 50; // default for very small numbers

  const scientificMatch = num.toString().match(/e-(\d+)/);
  if (scientificMatch) {
    decimalPlaces = parseInt(scientificMatch[1]) + 10; // add some buffer
  }

  const numStr = num.toFixed(decimalPlaces).replace(/\.?0+$/, '');

  // Find the first non-zero digit after decimal point
  const decimalIndex = numStr.indexOf('.');
  if (decimalIndex === -1) return numStr;

  const decimalPart = numStr.slice(decimalIndex + 1);
  let nonZeroIndex = -1;

  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] !== '0') {
      nonZeroIndex = i;
      break;
    }
  }

  if (nonZeroIndex === -1) return '0';

  // Take 2 significant digits after the first non-zero digit
  const significantDigits = 2;
  const endIndex = nonZeroIndex + significantDigits;
  const truncatedDecimal = decimalPart.substring(0, endIndex);

  return `0.${truncatedDecimal}`;
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard');
  } catch {
    toast('Could not copy');
  }
}

export const isPathMatching = (currentPath: string, pattern: string) => {
  if (!pattern) return false;
  // --
  const regexPattern = pattern.replace(/\//g, '\\/').replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentPath);
};

export function truncate(value?: string | null, start = 6, end = 4) {
  if (!value) return '';
  if (value.length <= start + end) return value;
  return value.slice(0, start) + '...' + value.slice(-end);
}

type ValidateZodSchemaResponse<T> = {
  error?: string;
  data?: T;
};

export function validateZodSchema<T>(schema: ZodObject, data: T): ValidateZodSchemaResponse<T> {
  try {
    return { data: schema.parse(data) as T };
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = e.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
      return { error: errors[0] };
    }

    return { error: 'Something went wrong' };
  }
}

export function toBigIntAmount(value: number, decimals: number) {
  const scaled = Math.trunc(value * 10 ** decimals);
  return BigInt(scaled);
}

export function toNumber(value: string | bigint, decimals = 18) {
  return Number(value) / 10 ** decimals;
}

export async function getNativeBalance(address: `0x${string}`) {
  const balance = await client.getBalance({ address });
  return Number(formatEther(balance));
}

export async function getTokenBalance(address: `0x${string}`, token: `0x${string}`) {
  const [rawBalance, decimals] = await Promise.all([
    client.readContract({
      address: token,
      abi: Erc20_Abi,
      functionName: 'balanceOf',
      args: [address],
    }),
    client.readContract({ address: token, abi: Erc20_Abi, functionName: 'decimals' }),
  ]);
  return Number(formatUnits(rawBalance as bigint, decimals as number));
}

export function getLifiWidgetConfig(opts?: {
  address?: string;
  bgColor?: string;
  userId?: string;
}): WidgetConfig {
  return {
    integrator: LIFI_INTEGRATOR,
    appearance: 'dark',
    variant: 'compact',
    subvariant: 'split',
    subvariantOptions: {
      split: 'swap',
    },
    sdkConfig: {
      userId: opts?.userId,
      rpcUrls: {
        [ChainId.BAS]: ['https://base-mainnet.g.alchemy.com/v2/5tKWi8XDxUwBx3T-UAqy2'],
      },
    },
    chains: {
      allow: [ChainId.BAS],
    },
    fromChain: ChainId.BAS,
    toChain: ChainId.BAS,
    toAddress: opts?.address
      ? { name: 'Connected Wallet', address: opts.address, chainType: ChainType.EVM }
      : undefined,
    hiddenUI: [
      'history',
      'language',
      'appearance',
      'toAddress',
      'chainSelect',
      'bridgesSettings',
      'addressBookConnectedWallets',
      'lowAddressActivityConfirmation',
    ],
    theme: {
      palette: {
        background: { default: opts?.bgColor ? opts.bgColor : 'rgb(10, 10, 10)' },
        primary: { main: '#05df72' },
        secondary: { main: '#05df72' },
      },
      typography: {
        fontFamily: 'var(--font-sans)',
      },
      container: {
        boxShadow: 'unset',
        height: 'fit-content',
        padding: 0,
        maxWidth: 'unset',
      },
    },
    feeConfig: {
      name: 'Zolify',
      logoURI: PROTOCOL_LOGO,
      fee: 0.01, // -- 1% fee
      showFeePercentage: true,
      showFeeTooltip: true,
    },
  };
}

export async function createEvent(runAt: Date, marketId: string, payload: any) {
  const expiresAt = runAt.toISOString().replace(/[-:T]/g, '').slice(0, 14) + '00';
  const body = {
    job: {
      enabled: true,
      title: `End market @ ${marketId}`,
      saveResponses: true,
      url: `${BASE_URL}/api/event`,
      requestMethod: 1,
      schedule: {
        timezone: 'UTC',
        minutes: [runAt.getUTCMinutes()],
        hours: [runAt.getUTCHours()],
        mdays: [runAt.getUTCDate()],
        months: [runAt.getUTCMonth() + 1],
        wdays: [-1],
        expiresAt: parseInt(expiresAt),
      },
      extendedData: {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'X-Secret': CRONJOB_API_KEY,
        },
      },
    },
  };

  const res = await fetch('https://api.cron-job.org/jobs', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${CRONJOB_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  if (res.ok) return data.jobId as number;
  return null;
}
