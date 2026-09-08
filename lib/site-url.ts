const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getSiteUrl(): URL {
  const configured =
    process.env.SITE_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  try {
    return new URL(normalizeSiteUrl(configured || FALLBACK_SITE_URL));
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

