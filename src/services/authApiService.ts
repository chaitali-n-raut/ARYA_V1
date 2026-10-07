import { User, UserRole } from '../types';

export type EmailDeliveryStatus = 'sent' | 'not_configured' | 'failed';

export interface PendingRegistration {
  email: string;
  deliveryStatus: EmailDeliveryStatus;
  resendAfterSeconds?: number;
}

export interface ApiAuthUser extends Omit<User, 'password' | 'isAuthenticated'> {
  emailVerified: boolean;
}

export interface ApiLoginResult {
  user: ApiAuthUser;
  emailVerified: boolean;
  loginNotificationStatus: EmailDeliveryStatus;
}

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; code: 'not_configured' | 'request_failed'; error: string };

const configuredBaseUrl = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.trim().replace(/\/$/, '');

/**
 * Frontend contract for a future server-owned authentication and email flow.
 * OTP generation, validation, expiry, throttling, password hashing and email delivery
 * must all be implemented by the server. This client never generates an OTP or sends email.
 */
class AuthApiService {
  public isConfigured(): boolean {
    return Boolean(configuredBaseUrl);
  }

  private notConfigured<T>(message: string): ApiResult<T> {
    return {
      success: false,
      code: 'not_configured',
      error: `${message} No email was sent and no account state was changed.`
    };
  }

  private async request<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<ApiResult<T>> {
    if (!configuredBaseUrl) {
      return this.notConfigured<T>('Authentication service is not configured.');
    }

    try {
      const response = await fetch(`${configuredBaseUrl}/api/auth${path}`, {
        method,
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const payload = await response.json().catch(() => ({})) as {
        data?: T;
        error?: string;
        message?: string;
        code?: string;
      };

      if (!response.ok) {
        return {
          success: false,
          code: 'request_failed',
          error: payload.message || payload.error || 'Authentication request failed.'
        };
      }
      if (!payload.data) {
        return { success: false, code: 'request_failed', error: 'Authentication server returned an invalid response.' };
      }
      return { success: true, data: payload.data };
    } catch {
      return {
        success: false,
        code: 'request_failed',
        error: 'Authentication service could not be reached. No email delivery was confirmed.'
      };
    }
  }

  public register(input: { name: string; email: string; password: string; role: UserRole }) {
    return this.request<PendingRegistration>('/register', 'POST', input);
  }

  public verifyEmail(input: { email: string; code: string }) {
    return this.request<{ emailVerified: boolean }>('/email/verify', 'POST', input);
  }

  public resendVerification(input: { email: string }) {
    return this.request<PendingRegistration>('/email/resend', 'POST', input);
  }

  public login(input: { email: string; password: string; role: UserRole }) {
    return this.request<ApiLoginResult>('/login', 'POST', input);
  }

  public getSession() {
    return this.request<{ user: ApiAuthUser }>('/session', 'GET');
  }

  public logout() {
    return this.request<{ success: boolean }>('/logout', 'POST', {});
  }

  public requestPasswordReset(input: { email: string }) {
    return this.request<{ deliveryStatus: EmailDeliveryStatus }>('/password-reset/request', 'POST', input);
  }

  public resetPassword(input: { email: string; code: string; newPassword: string }) {
    return this.request<{ passwordReset: boolean }>('/password-reset/confirm', 'POST', input);
  }
}

export const authApiService = new AuthApiService();
