import { useState, useCallback, useEffect } from 'react';

export type AuthState = {
  accessToken: string | null;
};

const STORAGE_KEY = 'auth';

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { accessToken: null };
  }
}

function saveToStorage(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Keep standalone key in sync so authHeaders() in api/auth.ts works
  if (state.accessToken) {
    localStorage.setItem('accessToken', state.accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }
}

// Singleton state so multiple hook instances stay in sync without a context.
let _state: AuthState = loadFromStorage();
const _listeners = new Set<() => void>();

function setState(next: AuthState) {
  _state = next;
  saveToStorage(next);
  _listeners.forEach((fn) => fn());
}

export function useAuthStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const notify = () => rerender((n) => n + 1);
    _listeners.add(notify);
    return () => {
      _listeners.delete(notify);
    };
  }, []);

  const login = useCallback((accessToken: string) => {
    setState({ accessToken });
  }, []);

  const logout = useCallback(() => {
    setState({ accessToken: null });
  }, []);

  return {
    accessToken: _state.accessToken,
    isLoggedIn: !!_state.accessToken,
    login,
    logout,
  };
}

export function globalLogout() {
  setState({ accessToken: null });
  window.location.href = '/sign-in';
}
