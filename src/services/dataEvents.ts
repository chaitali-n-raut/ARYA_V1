import { useEffect, useState } from 'react';

const EVENT_NAME = 'arya-data-changed';

/** Called by every service after it writes to the shared store. */
export function emitDataChange(): void {
  try {
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // non-browser environment
  }
}

/**
 * Returns a number that changes whenever ANY shared data changes
 * (same tab via custom event, other tabs via the `storage` event).
 * Components add it to a useEffect dependency list to re-read from the store.
 */
export function useDataVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  return version;
}
