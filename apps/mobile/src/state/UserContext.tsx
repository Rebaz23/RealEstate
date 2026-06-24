import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getUser } from "../api/client";
import { EndUser } from "../types";

const STORAGE_KEY = "realestate.userId";

interface UserContextValue {
  user: EndUser | null;
  loading: boolean;
  login: (user: EndUser) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: EndUser) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<EndUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedId) {
          const freshUser = await getUser(storedId);
          setUserState(freshUser);
        }
      } catch {
        // Stored id is stale (e.g. db was reseeded) — fall through to onboarding.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (newUser: EndUser) => {
    await AsyncStorage.setItem(STORAGE_KEY, newUser.id);
    setUserState(newUser);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const freshUser = await getUser(user.id);
    setUserState(freshUser);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, login, refresh, setUser: setUserState }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
