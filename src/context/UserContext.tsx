'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, PredictionTicket, PlatformNotification, BoutPick } from '@/core/domain/types';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  tickets: PredictionTicket[];
  notifications: PlatformNotification[];
  unreadNotifsCount: number;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithCredentials: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const loadTickets = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/predictions?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTickets(data.data);
      }
    } catch (e) {
      console.error('Error cargando boletos:', e);
    }
  }, []);

  const loadNotifications = useCallback(async (userId?: string) => {
    try {
      const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
    }
  }, []);

  // Cargar sesión inicial al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // 1. Intentar validar cookie de sesión vía GET /api/auth
        const res = await fetch('/api/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUser(data.data);
            await Promise.all([loadTickets(data.data.id), loadNotifications(data.data.id)]);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback con localStorage si existía ID previo
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('crono_user_id') : null;
        if (savedUserId) {
          const fallbackRes = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_user', userId: savedUserId }),
          });
          const data = await fallbackRes.json();
          if (data.success && data.data) {
            setUser(data.data);
            await Promise.all([loadTickets(data.data.id), loadNotifications(data.data.id)]);
          }
        } else {
          await loadNotifications();
        }
      } catch (err) {
        console.error('Error verificando sesión inicial:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [loadTickets, loadNotifications]);

  const loginWithCredentials = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crono_user_id', data.data.id);
        }
        await Promise.all([loadTickets(data.data.id), loadNotifications(data.data.id)]);
        return { success: true };
      }
      return { success: false, error: data.error || 'Credenciales inválidas' };
    } catch {
      return { success: false, error: 'Error al conectar con el servidor' };
    } finally {
      setLoading(false);
    }
  };

  const registerWithCredentials = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          name,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crono_user_id', data.data.id);
        }
        await Promise.all([loadTickets(data.data.id), loadNotifications(data.data.id)]);
        return { success: true };
      }
      return { success: false, error: data.error || 'Error al registrar usuario' };
    } catch {
      return { success: false, error: 'Error al conectar con el servidor' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
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
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crono_user_id', data.data.id);
        }
        await Promise.all([loadTickets(data.data.id), loadNotifications(data.data.id)]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async (name?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guest',
          name: name?.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crono_user_id', data.data.id);
        }
        await Promise.all([loadTickets(data.data.id), loadNotifications(data.data.id)]);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {}

    setUser(null);
    setTickets([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crono_user_id');
    }
    await loadNotifications();
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

  const markNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read', userId: user?.id }),
      });
    } catch {}
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
        loginWithCredentials,
        registerWithCredentials,
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
