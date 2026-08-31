'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Calendar, Dumbbell, Trophy, Newspaper, Swords, Zap } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-md border-b-2 border-[#CDCDCF] shadow-sm">
      {/* Top Accent Stripe with Coral and Turquoise */}
      <div className="h-1 w-full bg-gradient-to-r from-[#EC4D25] via-[#2BCFCE] to-[#EC4D25]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-[#EC4D25] flex items-center justify-center shadow-md shadow-[#EC4D25]/30 group-hover:scale-105 transition-transform duration-200 sports-skew">
                <Flame className="w-6 h-6 text-white sports-unskew" />
              </div>
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black tracking-tight text-[#0E1015] font-display uppercase">
                    CRONO<span className="text-[#EC4D25]">PORTE</span>
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#2BCFCE] text-[#0E1015] font-sport uppercase tracking-wider">
                    UFC LIVE
                  </span>
                </div>
                <span className="block text-[11px] font-bold tracking-widest text-[#939599] -mt-1 font-sport uppercase">
                  ESPN Fight Center & Stats Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link
              href="#fightcard"
              className="px-3 py-1.5 rounded-md text-sm font-bold font-sport uppercase tracking-wider text-[#EC4D25] bg-[#EC4D25]/10 border border-[#EC4D25]/30 hover:bg-[#EC4D25]/20 transition-all flex items-center space-x-1.5"
            >
              <Flame className="w-4 h-4" />
              <span>Cartelera</span>
            </Link>

            <Link
              href="#careo-paralax"
              className="px-3 py-1.5 rounded-md text-sm font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#2BCFCE] hover:bg-[#2BCFCE]/10 transition-all flex items-center space-x-1.5 border border-transparent hover:border-[#2BCFCE]/30"
            >
              <Swords className="w-4 h-4 text-[#2BCFCE]" />
              <span>Careo 3D & Momios</span>
            </Link>

            <Link
              href="#rankings"
              className="px-3 py-1.5 rounded-md text-sm font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-black/5 transition-all flex items-center space-x-1.5"
            >
              <Trophy className="w-4 h-4 text-[#939599]" />
              <span>Rankings</span>
            </Link>

            <Link
              href="#noticias"
              className="px-3 py-1.5 rounded-md text-sm font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-black/5 transition-all flex items-center space-x-1.5"
            >
              <Newspaper className="w-4 h-4 text-[#939599]" />
              <span>Noticias</span>
            </Link>

            <Link
              href="#calendar"
              className="px-3 py-1.5 rounded-md text-sm font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-black/5 transition-all flex items-center space-x-1.5"
            >
              <Calendar className="w-4 h-4 text-[#939599]" />
              <span>Calendario</span>
            </Link>

            <Link
              href="#gyms"
              className="px-3 py-1.5 rounded-md text-sm font-bold font-sport uppercase tracking-wider text-[#0E1015] hover:text-[#EC4D25] hover:bg-black/5 transition-all flex items-center space-x-1.5"
            >
              <Dumbbell className="w-4 h-4 text-[#939599]" />
              <span>Gyms</span>
            </Link>
          </nav>

          {/* Live API ESPN Signal Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1015] text-white border border-[#2BCFCE]/50 text-xs font-bold font-sport tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2BCFCE] animate-ping" />
              <span className="text-[#2BCFCE]">API ESPN CONECTADA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

