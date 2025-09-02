import { ZodObject, ZodError } from 'zod';
import qs from 'querystring';
import { toast } from 'sonner';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { base } from 'viem/chains';

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

export function formatNumber(number?: number | null) {
  if (!number || number == 0) return '0';

  const num = Math.abs(number);
  if (num >= 1_000_000_000_000) return (number / 1_000_000_000_000).toFixed(2) + 'T';
  if (num >= 1_000_000_000) return (number / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (number / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (number / 1_000).toFixed(2) + 'K';

  if (num >= 0.001) {
    return number.toFixed(3).replace(/\.?0+$/, '');
  }

  return '<0.001';
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

export function toNumber(value: string, decimals = 18) {
  return Number(value) / 10 ** decimals;
}

const client = createPublicClient({
  chain: base,
  transport: http(),
});

const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
];

export async function getNativeBalance(address: `0x${string}`) {
  const balance = await client.getBalance({ address });
  return Number(formatEther(balance));
}

export async function getTokenBalance(address: `0x${string}`, token: `0x${string}`) {
  const [rawBalance, decimals] = await Promise.all([
    client.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    }),
    client.readContract({ address: token, abi: ERC20_ABI, functionName: 'decimals' }),
  ]);
  return Number(formatUnits(rawBalance as bigint, decimals as number));
}
