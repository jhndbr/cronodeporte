'use client';

import React from 'react';
import { Calendar, MapPin, Trophy, Flame, Swords, ExternalLink, Zap } from 'lucide-react';
import { Event } from '../core/domain/types';
import { GymBadge } from './GymBadge';

interface EventHeroProps {
  event: Event;
}

export function EventHero({ event }: EventHeroProps) {
  const mainBout = event.matches[0];
  const red = mainBout?.participants.find((p) => p.side === 'RED_CORNER');
  const blue = mainBout?.participants.find((p) => p.side === 'BLUE_CORNER');

  const redGym = red?.participant.affiliations[0]?.affiliation;
  const blueGym = blue?.participant.affiliations[0]?.affiliation;

  const redStats = red?.participant.stats as import('../core/domain/types').FighterStats | undefined;
  const blueStats = blue?.participant.stats as import('../core/domain/types').FighterStats | undefined;

  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#0E1015] border-2 border-[#CDCDCF]/40 shadow-2xl text-white">
      {/* Dynamic Sports Lighting Background */}
      <div className="absolute -top-24 left-1/4 w-80 h-80 bg-[#EC4D25]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-80 h-80 bg-[#2BCFCE]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 ufc-cage-mesh opacity-20 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 px-6 py-4 bg-black/40 border-b border-[#282E3E] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-widest sports-skew flex items-center space-x-1.5 shadow-md shadow-[#EC4D25]/30">
            <Flame className="w-3.5 h-3.5 sports-unskew" />
            <span className="sports-unskew">{event.shortName || 'UFC EVENT'}</span>
          </span>

          <span className="text-[#CDCDCF] text-xs sm:text-sm font-sport font-semibold flex items-center space-x-1.5 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-[#2BCFCE]" />
            <span className="capitalize">{formattedDate} • {formattedTime} HS</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs sm:text-sm font-sport text-[#939599] uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-[#EC4D25]" />
          <span>{event.venueName || 'T-Mobile Arena'}, {event.city || 'Las Vegas'}</span>
        </div>
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Main Event Title Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-[#CDCDCF]/20 text-[#2BCFCE] font-sport text-xs font-bold uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5 text-[#2BCFCE]" />
            <span>CARTELERA PRINCIPAL UFC FIGHT NIGHT & PPV</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display leading-none">
            {event.name}
          </h1>

          {mainBout?.isTitleFight && (
            <div className="mt-3 inline-flex items-center space-x-2 px-4 py-1.5 rounded-md bg-gradient-to-r from-[#E5A93C]/20 via-[#E5A93C]/30 to-[#E5A93C]/20 border border-[#E5A93C]/60 text-[#E5A93C] text-xs sm:text-sm font-sport font-black uppercase tracking-widest shadow-lg">
              <Trophy className="w-4 h-4 text-[#E5A93C]" />
              <span>CINTURÓN MUNDIAL EN JUEGO • {mainBout.weightClass}</span>
            </div>
          )}
        </div>

        {/* Head-to-Head Showdown (Red vs Blue) */}
        {mainBout && red && blue && (
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center max-w-5xl mx-auto my-2 bg-[#151821]/90 p-6 sm:p-8 rounded-xl border border-[#282E3E] backdrop-blur-md relative overflow-hidden">
            {/* Corner Color Bars */}
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#EC4D25]" />
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-[#2BCFCE]" />

            {/* Red Fighter */}
            <div className="md:col-span-5 flex items-center space-x-4 pl-2">
              <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl p-1 bg-gradient-to-b from-[#EC4D25] to-[#451408] border-2 border-[#EC4D25] overflow-hidden shadow-xl shadow-[#EC4D25]/30 sports-skew">
                <img
                  src={red.participant.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                  alt={red.participant.displayName}
                  className="w-full h-full object-cover object-top sports-unskew"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-black tracking-widest text-[#EC4D25] font-sport">
                  ESQUINA ROJA
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-none font-display uppercase tracking-wide">
                  {red.participant.displayName}
                </h3>
                {red.participant.nickname && (
                  <p className="text-xs text-[#EC4D25] font-sport font-bold italic tracking-wider">
                    "{red.participant.nickname}"
                  </p>
                )}
                <p className="text-xs font-sport text-[#CDCDCF] font-bold tracking-wider">
                  RÉCORD: <span className="text-white">{redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}</span>
                </p>
                <div className="pt-1">
                  <GymBadge affiliation={redGym} />
                </div>
              </div>
            </div>

            {/* Center VS Indicator */}
            <div className="md:col-span-1 text-center flex md:flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-[#0E1015] border-2 border-[#282E3E] flex items-center justify-center shadow-lg transform rotate-45">
                <span className="text-lg font-black text-white font-display uppercase -rotate-45">
                  VS
                </span>
              </div>
            </div>

            {/* Blue Fighter */}
            <div className="md:col-span-5 flex items-center justify-end space-x-4 flex-row-reverse md:flex-row text-right md:text-left pr-2">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-black tracking-widest text-[#2BCFCE] font-sport">
                  ESQUINA AZUL
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-none font-display uppercase tracking-wide">
                  {blue.participant.displayName}
                </h3>
                {blue.participant.nickname && (
                  <p className="text-xs text-[#2BCFCE] font-sport font-bold italic tracking-wider">
                    "{blue.participant.nickname}"
                  </p>
                )}
                <p className="text-xs font-sport text-[#CDCDCF] font-bold tracking-wider">
                  RÉCORD: <span className="text-white">{blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}</span>
                </p>
                <div className="pt-1 flex justify-end md:justify-start">
                  <GymBadge affiliation={blueGym} />
                </div>
              </div>
              <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl p-1 bg-gradient-to-b from-[#2BCFCE] to-[#0A3D3C] border-2 border-[#2BCFCE] overflow-hidden shadow-xl shadow-[#2BCFCE]/30 sports-skew">
                <img
                  src={blue.participant.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                  alt={blue.participant.displayName}
                  className="w-full h-full object-cover object-top sports-unskew"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button to scroll to Careo */}
        <div className="text-center mt-6">
          <a
            href="#careo-paralax"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-black text-sm uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl shadow-[#EC4D25]/30 sports-skew"
          >
            <Swords className="w-4 h-4 sports-unskew" />
            <span className="sports-unskew">VER CAREO 3D CON PARALLAX Y APUESTAS</span>
          </a>
        </div>
      </div>
    </section>
  );
}

