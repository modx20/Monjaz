export const DEFAULT_SITE_URL = 'https://monjazz.netlify.app';

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
  ];

  for (const raw of candidates) {
    if (raw && raw.trim()) {
      const cleaned = raw.trim().replace(/\/+$/, '');
      return cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    }
  }

  return DEFAULT_SITE_URL;
}

export function toAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === '/') {
    return base;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
