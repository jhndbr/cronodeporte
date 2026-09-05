'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { getCountryFlagUrl } from '@/utils/country-flags';

interface FighterAvatarProps {
  src?: string;
  name: string;
  country?: string;
  side?: 'RED_CORNER' | 'BLUE_CORNER' | 'CHAMPION' | 'NEUTRAL';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isWinner?: boolean;
}

export function FighterAvatar({
  src,
  name,
  country,
  side = 'NEUTRAL',
  size = 'md',
  className = '',
  isWinner = false,
}: FighterAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const flagUrl = getCountryFlagUrl(country, name);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 sm:w-16 sm:h-16 text-sm',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-base',
    xl: 'w-28 h-28 sm:w-36 sm:h-36 text-xl',
    '2xl': 'w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 text-2xl',
  }[size];

  const cornerBorders = {
    RED_CORNER: 'border-2 border-[#EC4D25] shadow-lg shadow-[#EC4D25]/20',
    BLUE_CORNER: 'border-2 border-[#2BCFCE] shadow-lg shadow-[#2BCFCE]/20',
    CHAMPION: 'border-2 border-[#E5A93C] shadow-lg shadow-[#E5A93C]/20',
    NEUTRAL: 'border border-[#CDCDCF]/60 shadow-sm',
  }[side];

  const initials = name
    ? name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'UFC';

  const validUrl = src && src.trim().length > 0 && !src.includes('default.png') ? src : null;

  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden flex items-center justify-center select-none bg-[#0E1015] ${sizeClasses} ${cornerBorders} ${className}`}
    >
      {/* 1. Fondo: Bandera de país oficial o Rejas del Octágono UFC por defecto */}
      {flagUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 scale-105"
          style={{ backgroundImage: `url(${flagUrl})` }}
        >
          {/* Overlay oscuro para destacar el cutout PNG del peleador */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
        </div>
      ) : (
        /* Rejas del Octágono UFC como fallback oficial */
        <div className="absolute inset-0 ufc-cage-mesh">
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>
      )}

      {/* 2. Peleador PNG en primer plano */}
      {validUrl && !hasError ? (
        <img
          src={validUrl}
          alt={name}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="relative z-10 w-full h-full object-contain object-bottom transition-all duration-300 drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]"
        />
      ) : (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 text-center">
          <User className="w-1/2 h-1/2 opacity-70 mb-0.5 text-white drop-shadow-md" />
          <span className="font-display font-black tracking-wider leading-none text-white drop-shadow-md">
            {initials}
          </span>
        </div>
      )}

      {/* 3. Badge de Victoria */}
      {isWinner && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-emerald-600 text-white text-[9px] font-black text-center uppercase tracking-wider py-0.5 shadow-md">
          WIN
        </div>
      )}
    </div>
  );
}
