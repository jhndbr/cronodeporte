'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Calendar, Dumbbell, Trophy, Newspaper, Swords } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#CDCDCF] shadow-sm">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#EC4D25] via-[#2BCFCE] to-[#EC4D25]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#EC4D25] flex items-center justify-center shadow-sm">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black tracking-tight text-[#0E1015] font-display uppercase">
                CRONO<span className="text-[#EC4D25]">PORTE</span>
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#0E1015] text-[#2BCFCE] font-sport uppercase tracking-wider">
                UFC
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="#fightcard"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-[#0E1015]/5 transition-colors flex items-center space-x-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#EC4D25]" />
              <span>Cartelera</span>
            </Link>

            <Link
              href="#careo-paralax"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#2BCFCE] hover:bg-[#0E1015]/5 transition-colors flex items-center space-x-1.5"
            >
              <Swords className="w-3.5 h-3.5 text-[#2BCFCE]" />
              <span>Careo 3D</span>
            </Link>

            <Link
              href="#rankings"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-[#0E1015]/5 transition-colors flex items-center space-x-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-[#939599]" />
              <span>Rankings</span>
            </Link>

            <Link
              href="#noticias"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-[#0E1015]/5 transition-colors flex items-center space-x-1.5"
            >
              <Newspaper className="w-3.5 h-3.5 text-[#939599]" />
              <span>Noticias</span>
            </Link>

            <Link
              href="#calendar"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-[#0E1015]/5 transition-colors flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#939599]" />
              <span>Calendario</span>
            </Link>

            <Link
              href="#gyms"
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-[#0E1015]/5 transition-colors flex items-center space-x-1.5"
            >
              <Dumbbell className="w-3.5 h-3.5 text-[#939599]" />
              <span>Gimnasios</span>
            </Link>
          </nav>

          {/* Live Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1015] text-white text-xs font-bold font-sport tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#2BCFCE] animate-pulse" />
              <span className="text-[#2BCFCE] font-black text-[11px]">ESPN LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
