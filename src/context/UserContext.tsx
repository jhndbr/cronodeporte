'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PredictionTicket, PlatformNotification, BoutPick } from '@/core/domain/types';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  tickets: PredictionTicket[];
  notifications: PlatformNotification[];
  unreadNotifsCount: number;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => void;
  submitPredictionTicket: (type: 'SINGLE' | 'COMBO', picks: Omit<BoutPick, 'status'>[]) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  markNotificationsAsRead: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<PredictionTicket[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  // Cargar usuario y notificaciones al iniciar
  useEffect(() => {
    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('crono_user_id') : null;

    if (savedUserId) {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_user', userId: savedUserId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setUser(data.data);
            loadTickets(data.data.id);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Cargar notificaciones
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setNotifications(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const loadTickets = async (userId: string) => {
    try {
      const res = await fetch(`/api/predictions?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTickets(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Simulación de OAuth con Google Profile estándar (listo para conectar con Google ClientID)
      const mockGoogleName = 'Fanático UFC';
      const mockGoogleEmail = 'user.ufc@gmail.com';
      const mockAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google_login',
          name: mockGoogleName,
          email: mockGoogleEmail,
          avatarUrl: mockAvatar,
          provider: 'google',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crono_user_id', data.data.id);
        }
        await loadTickets(data.data.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async (name?: string) => {
    setLoading(true);
    try {
      const chosenName = name?.trim() || 'Peleador_' + Math.floor(1000 + Math.random() * 9000);
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          name: chosenName,
          provider: 'guest',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crono_user_id', data.data.id);
        }
        await loadTickets(data.data.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTickets([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crono_user_id');
    }
  };

  const submitPredictionTicket = async (
    type: 'SINGLE' | 'COMBO',
    picks: Omit<BoutPick, 'status'>[]
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type,
          picks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) setUser(data.user);
        await loadTickets(user.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_user', userId: user.id }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      setUser(data.data);
      await loadTickets(data.data.id);
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        tickets,
        notifications,
        unreadNotifsCount,
        loginWithGoogle,
        loginAsGuest,
        logout,
        submitPredictionTicket,
        refreshUserData,
        markNotificationsAsRead,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
}
