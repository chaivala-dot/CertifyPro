export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

const BASE_URL = "/api/auth";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) {
        message = data.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) {
        message = data.error;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const json = (await res.json()) as { success: boolean; data: { user: AuthUser } };
  return json.data.user;
}

export async function signup(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthUser> {
  const response = await request<{
    success: boolean;
    data: { user: AuthUser; token: string };
  }>("/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data.user;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const response = await request<{
    success: boolean;
    data: { user: AuthUser; token: string };
  }>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data.user;
}

export function logout() {
  return request<void>("/logout", {
    method: "POST",
  });
}

export function loginWithGoogle() {
  window.location.href = "/api/auth/google";
}

