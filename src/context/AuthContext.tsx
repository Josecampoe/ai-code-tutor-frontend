import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'codetutor_token';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = (authenticatedUser: User, token: string) => {
    setUser(authenticatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
