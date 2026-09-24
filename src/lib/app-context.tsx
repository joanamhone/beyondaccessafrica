import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

type AppState = {
  theme: Theme;
  toggleTheme: () => void;
  sessionId: string;
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
};

const AppContext = createContext<AppState | null>(null);

function getSessionId(): string {
  let id = sessionStorage.getItem('baa_session_id');
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem('baa_session_id', id);
  }
  return id;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('baa_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [sessionId] = useState<string>(getSessionId);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('baa_theme', theme);
  }, [theme]);

  const value: AppState = {
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    sessionId,
    pageLoading,
    setPageLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
