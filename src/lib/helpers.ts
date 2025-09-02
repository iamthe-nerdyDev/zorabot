import { ZodObject, ZodError } from 'zod';
import qs from 'querystring';

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
  } catch {}
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
