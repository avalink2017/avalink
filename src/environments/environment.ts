export const environment = {
  production: true,
  apiUrl: (window as any).env?.API_URL || '',
  apiKey: (window as any).env?.API_KEY || '',
  turnstileKey: (window as any).env?.TURNSTILE_SITE_KEY || '',
};
