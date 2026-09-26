export const BACKEND_URL = 'https://shivay-cafe-web-architect-986671745910.asia-southeast1.run.app';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && (origin.includes('run.app') || origin.includes('localhost:3000'))) {
      return cleanPath;
    }
  }
  return `${BACKEND_URL}${cleanPath}`;
}

export function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && (origin.includes('run.app') || origin.includes('localhost:3000'))) {
      return origin;
    }
  }
  return BACKEND_URL;
}
