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
