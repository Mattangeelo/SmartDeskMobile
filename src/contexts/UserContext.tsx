import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { AuthUser } from "../types";
import { getUser as getStoredUser, setUser as storeUser, clearSession, setOnSessionExpired } from "../services/api";

interface UserContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getStoredUser<AuthUser>();
      setUserState(stored);
      setLoading(false);
    })();
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      storeUser(u);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUserState(null);
  }, []);

  // If the API layer hits a 401, drop the session so the navigator sends
  // the person back to the login screen.
  useEffect(() => {
    setOnSessionExpired(() => setUserState(null));
    return () => setOnSessionExpired(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
