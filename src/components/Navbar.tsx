'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Calendar, Dumbbell, Trophy, Newspaper, Swords, Bell, User } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';
import { NotificationsDropdown } from './NotificationsDropdown';

export function Navbar() {
  const { user, unreadNotifsCount } = useUser();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/60 border-b border-white/15 backdrop-blur-md shadow-2xl text-white">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#EC4D25] via-[#2BCFCE] to-[#EC4D25]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#EC4D25] flex items-center justify-center shadow-md shadow-[#EC4D25]/30 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black tracking-tight text-white font-display uppercase">
                CRONO<span className="text-[#EC4D25]">PORTE</span>
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10 text-[#2BCFCE] border border-white/15 font-sport uppercase tracking-wider">
                UFC
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="#fightcard"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#EC4D25]" />
              <span>Cartelera</span>
            </Link>

            <Link
              href="#careo-paralax"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5"
            >
              <Swords className="w-3.5 h-3.5 text-[#2BCFCE]" />
              <span>Careo 3D</span>
            </Link>

            <Link
              href="#rankings"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Rankings</span>
            </Link>

            <Link
              href="#noticias"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5"
            >
              <Newspaper className="w-3.5 h-3.5 text-slate-400" />
              <span>Noticias</span>
            </Link>

            <Link
              href="#calendar"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Calendario</span>
            </Link>

            <Link
              href="#gyms"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5"
            >
              <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
              <span>Gimnasios</span>
            </Link>
          </nav>

          {/* User Profile & Notifications Center */}
          <div className="flex items-center space-x-2.5">
            {/* Campana de Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setIsNotifsOpen(!isNotifsOpen)}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all hover:scale-105 active:scale-95"
                title="Notificaciones"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EC4D25] text-white font-sport font-black text-[9px] flex items-center justify-center animate-pulse shadow-sm">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              <NotificationsDropdown isOpen={isNotifsOpen} onClose={() => setIsNotifsOpen(false)} />
            </div>

            {/* Usuario / Login */}
            {user ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all hover:scale-105 active:scale-95 group"
                title="Ver mi perfil y pronósticos"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#EC4D25]"
                />
                <span className="text-xs font-black font-sport uppercase tracking-wide hidden sm:inline max-w-[90px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#EC4D25] text-white font-sport">
                  {user.stats.accuracyRate}%
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#EC4D25]/30 hover:scale-105 active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
}
