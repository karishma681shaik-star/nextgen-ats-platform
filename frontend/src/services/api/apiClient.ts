const resolveApiBaseUrl = (): string => {
  const envUrl = ((import.meta as any).env?.VITE_API_URL) as string | undefined;

  if (envUrl && envUrl.trim()) {
    // If accessed from mobile on LAN IP but envUrl points to localhost, map to the host PC's LAN IP
    if (
      typeof window !== 'undefined' &&
      window.location.hostname &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))
    ) {
      return envUrl
        .replace('localhost', window.location.hostname)
        .replace('127.0.0.1', window.location.hostname);
    }
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8080/api`;
  }

  return 'http://localhost:8080/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = 'ai_ats_auth_token';

export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // JSON content type for normal requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach JWT to protected requests
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url =
    `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {

    // Authentication expired/invalid
    if (response.status === 401) {
      tokenStorage.remove();
    }

    const errorMsg =
      data?.message ||
      data?.error ||
      `HTTP Error ${response.status}`;

    throw new Error(errorMsg);
  }

  // Your backend ApiResponse wraps actual data inside "data"
  return data?.data !== undefined ? data.data : data;
}