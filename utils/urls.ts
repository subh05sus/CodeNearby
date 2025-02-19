export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.trim().replace(/\/$/, "");
  }
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
}

export function generateOgImageUrl(title1?: string, title2?: string) {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams();

  if (title1) params.set("title", title1);
  if (title2) params.set("date", title2);

  return `${baseUrl}/api/og?${params.toString()}`;
}
