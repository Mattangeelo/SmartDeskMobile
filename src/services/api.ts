import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Set EXPO_PUBLIC_API_URL in a .env file, or edit `extra.apiUrl` in app.json.
// Note: on a physical device running Expo Go, "localhost" points at the phone
// itself — use your machine's LAN IP (e.g. http://192.168.0.10:3000) instead.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  "https://meuapp.local/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getUser<T = Record<string, unknown>>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setUser<T>(user: T) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession() {
  await clearToken();
  await AsyncStorage.removeItem(USER_KEY);
}

// Called by the API client when a 401 forces a logout. The navigator listens
// via UserContext instead of doing a hard `window.location` redirect like the
// web app did.
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(cb: (() => void) | null) {
  onSessionExpired = cb;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isAuthRoute = path.startsWith("/auth/login");

  if (res.status === 401 && !isAuthRoute) {
    await clearSession();
    onSessionExpired?.();
    throw new Error("Sessão expirada");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T, B = unknown>(path: string, body: B) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T, B = unknown>(path: string, body: B) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T, B = unknown>(path: string, body: B) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
