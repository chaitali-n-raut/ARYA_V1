import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { webcrypto } from 'node:crypto';
import { AuthService } from './authService';

const ACCOUNT_KEY = 'arya_ai_registered_accounts_v6';
const SESSION_KEY = 'arya_ai_current_user_v6';
const OTHER_DATA = {
  arya_ai_students_db_v6: '[{"Student_ID":"KEEP-STUDENT"}]',
  arya_ai_student_datasets_v1: '[{"datasetId":"KEEP-DATASET"}]',
  arya_ai_placement_drives_v2: '[{"id":"KEEP-DRIVE"}]',
  arya_ai_applications_v2: '[{"applicationId":"KEEP-APPLICATION"}]',
  arya_ai_notifications_v2: '[{"id":"KEEP-NOTIFICATION"}]'
};

function withIsolatedLocalStorage<T>(run: (values: Map<string, string>) => T): T {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const values = new Map<string, string>(Object.entries(OTHER_DATA));
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key)
    }
  });
  if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });

  try {
    return run(values);
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
    if (originalCrypto) Object.defineProperty(globalThis, 'crypto', originalCrypto);
    else Reflect.deleteProperty(globalThis, 'crypto');
  }
}

function registerAccount(service: AuthService) {
  return service.registerUser({
    name: 'Demo User',
    email: 'Demo.User@example.test',
    password: 'prototype-password-123',
    role: 'tnp'
  });
}

describe('local prototype authentication persistence', () => {
  it('registers an account with a stable ID and stores a password-free current session', () => {
    withIsolatedLocalStorage((storage) => {
      const service = new AuthService();
      const result = registerAccount(service);

      assert.equal(result.success, true);
      assert.ok(result.user?.id);
      assert.equal(result.user?.role, 'tnp');
      assert.equal(result.user?.password, undefined);
      assert.equal(JSON.parse(storage.get(SESSION_KEY) || '{}').password, undefined);
      assert.equal(JSON.parse(storage.get(ACCOUNT_KEY) || '[]')[0].email, 'demo.user@example.test');
    });
  });

  it('rejects duplicate emails case-insensitively', () => {
    withIsolatedLocalStorage(() => {
      const service = new AuthService();
      assert.equal(registerAccount(service).success, true);
      const duplicate = service.registerUser({
        name: 'Second User',
        email: 'DEMO.USER@EXAMPLE.TEST',
        password: 'another-password',
        role: 'student'
      });
      assert.equal(duplicate.success, false);
      assert.equal(duplicate.error, 'An account with this email already exists.');
    });
  });

  it('rejects an incorrect password and a mismatched role', () => {
    withIsolatedLocalStorage(() => {
      const service = new AuthService();
      registerAccount(service);
      service.logout();
      assert.equal(service.loginWithCredentials('demo.user@example.test', 'wrong-password', 'tnp').success, false);
      assert.equal(service.loginWithCredentials('demo.user@example.test', 'prototype-password-123', 'faculty').success, false);
      assert.equal(service.getCurrentUser(), null);
    });
  });

  it('preserves role and session after constructing a new service instance (refresh simulation)', () => {
    withIsolatedLocalStorage(() => {
      const firstInstance = new AuthService();
      registerAccount(firstInstance);
      firstInstance.logout();
      assert.equal(firstInstance.loginWithCredentials('demo.user@example.test', 'prototype-password-123', 'tnp').success, true);

      const afterRefresh = new AuthService();
      assert.equal(afterRefresh.getCurrentUser()?.role, 'tnp');
      assert.equal(afterRefresh.getCurrentUser()?.email, 'demo.user@example.test');
      assert.equal(afterRefresh.getCurrentUser()?.password, undefined);
    });
  });

  it('logout clears only the session; account and unrelated application data survive and login works again', () => {
    withIsolatedLocalStorage((storage) => {
      const service = new AuthService();
      registerAccount(service);
      service.logout();

      assert.equal(storage.has(SESSION_KEY), false);
      assert.equal(storage.has(ACCOUNT_KEY), true);
      for (const [key, value] of Object.entries(OTHER_DATA)) assert.equal(storage.get(key), value);

      const loginAgain = service.loginWithCredentials('demo.user@example.test', 'prototype-password-123', 'tnp');
      assert.equal(loginAgain.success, true);
      assert.equal(loginAgain.user?.role, 'tnp');
    });
  });
});
