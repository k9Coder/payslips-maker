import { useAuth } from '@clerk/clerk-react';
import type { ApiResponse } from '@payslips-maker/shared';
import { getDemoResponse } from '@/demo/demoData';
import { useImpersonation } from '@/domains/admin/context/ImpersonationContext';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export function useApiClient() {
  const { getToken } = useAuth();
  const impersonation = useImpersonation();

  async function request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (DEMO_MODE) {
      return getDemoResponse<T>(url, options.method ?? 'GET', impersonation?.targetUserId);
    }

    const token = await getToken();

    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(impersonation ? { 'X-Impersonate-User': impersonation.targetUserId } : {}),
        ...options.headers,
      },
    });

    // Handle USER_SYNC_REQUIRED: user authenticated but not yet in DB
    if (res.status === 202) {
      const body = (await res.json()) as ApiResponse<null>;
      if (body.error === 'USER_SYNC_REQUIRED') {
        throw new Error('USER_SYNC_REQUIRED');
      }
    }

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as ApiResponse<null>;
        errMsg = body.error ?? errMsg;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    return res.json() as Promise<T>;
  }

  async function get<T>(url: string): Promise<T> {
    return request<T>(url);
  }

  async function post<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async function put<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async function del<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'DELETE' });
  }

  async function patch<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async function postSync(email: string, fullName: string): Promise<void> {
    if (DEMO_MODE) return;
    const token = await getToken();
    await fetch(`${API_BASE}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ email, fullName }),
    });
  }

  return { get, post, put, patch, del, postSync };
}
