'use client';

import React, { useRef, useEffect } from 'react';
import { Bell, Flame, Calendar, Trophy, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { notifications, markNotificationsAsRead } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      markNotificationsAsRead();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-black/90 border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden z-50 text-white animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#2BCFCE]" />
          <span className="text-xs font-black font-sport uppercase tracking-wider text-white">
            Notificaciones de Plataforma
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs font-sport text-slate-400">
            No tienes notificaciones pendientes.
          </div>
        ) : (
          notifications.map((n) => (
            <a
              key={n.id}
              href={n.linkUrl || '#'}
              onClick={onClose}
              className="block p-3.5 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-white/10 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {n.type === 'EVENT_STARTING' && <Flame className="w-4 h-4 text-[#EC4D25]" />}
                  {n.type === 'NEXT_EVENT' && <Calendar className="w-4 h-4 text-[#2BCFCE]" />}
                  {n.type === 'PREDICTION_RESOLVED' && <Trophy className="w-4 h-4 text-[#E5A93C]" />}
                  {n.type === 'NEWS_ALERT' && <Bell className="w-4 h-4 text-slate-300" />}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h5 className="text-xs font-black font-sport uppercase text-white truncate">
                    {n.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-snug font-sport">
                    {n.message}
                  </p>
                  <span className="text-[9px] text-slate-500 font-sport block pt-0.5">
                    {new Date(n.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 self-center" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
