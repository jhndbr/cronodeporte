'use client';

import React, { useState, useRef } from 'react';
import { Swords, Flame, Trophy, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Match } from '../core/domain/types';

interface UfcCareoParallaxProps {
  matches: Match[];
}

export function UfcCareoParallax({ matches }: UfcCareoParallaxProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const displayMatches = matches.length > 0 ? matches : [];
  const currentMatch = displayMatches[selectedIndex] || displayMatches[0];

  const redParticipant = currentMatch?.participants?.find((p) => p.side === 'RED_CORNER');
  const blueParticipant = currentMatch?.participants?.find((p) => p.side === 'BLUE_CORNER');

  const red = redParticipant?.participant;
  const blue = blueParticipant?.participant;

  const redStats = red?.stats as import('../core/domain/types').FighterStats | undefined;
  const blueStats = blue?.stats as import('../core/domain/types').FighterStats | undefined;

  const redGym = red?.affiliations?.[0]?.affiliation;
  const blueGym = blue?.affiliations?.[0]?.affiliation;

  // Odds calculation & Implied Probability
  const redOddAmerican = redParticipant?.currentOdd?.american || '-135';
  const blueOddAmerican = blueParticipant?.currentOdd?.american || '+115';
  const redOddDecimal = redParticipant?.currentOdd?.decimal || 1.74;
  const blueOddDecimal = blueParticipant?.currentOdd?.decimal || 2.15;

  const redProb = Math.round(
    redOddDecimal > 0 ? (1 / redOddDecimal) * 100 : 55
  );
  const blueProb = Math.max(10, Math.min(90, 100 - redProb));

  // Parallax Effect Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleNextMatch = () => {
    if (displayMatches.length === 0) return;
    setSelectedIndex((prev) => (prev + 1) % displayMatches.length);
  };

  const handlePrevMatch = () => {
    if (displayMatches.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + displayMatches.length) % displayMatches.length);
  };

  if (!currentMatch) return null;

  return (
    <section id="careo-paralax" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#CDCDCF] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#2BCFCE] text-[#0E1015] shadow-md shadow-[#2BCFCE]/30 sports-skew">
            <Swords className="w-6 h-6 sports-unskew" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                CAREO 3D & MOMIOS DE APUESTAS
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider sports-skew">
                <span className="sports-unskew">PARALLAX OCTAGON</span>
              </span>
            </div>
            <p className="text-xs font-sport font-bold text-[#939599] uppercase tracking-widest block -mt-1">
              Fondo de rejas UFC interactivo • Comparativa Face-Off • Probabilidad de Victoria
            </p>
          </div>
        </div>

        {/* Match Switcher Tabs / Carousel Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMatch}
            className="p-2 rounded-lg bg-white border border-[#CDCDCF] text-[#0E1015] hover:bg-[#EC4D25] hover:text-white transition-all shadow-sm"
            aria-label="Pelea anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 overflow-x-auto max-w-md p-1 bg-[#EAECEF] rounded-lg border border-[#CDCDCF]">
            {displayMatches.map((m, idx) => (
              <button
                key={m.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedIndex === idx
                    ? 'bg-[#0E1015] text-[#2BCFCE] shadow-sm'
                    : 'text-[#939599] hover:text-[#0E1015]'
                }`}
              >
                {m.isMainEvent ? '★ ' : ''}#{idx + 1} {m.title?.split('vs')[0]?.trim()?.split(' ').pop()}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextMatch}
            className="p-2 rounded-lg bg-white border border-[#CDCDCF] text-[#0E1015] hover:bg-[#EC4D25] hover:text-white transition-all shadow-sm"
            aria-label="Siguiente pelea"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Parallax Staredown Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-3xl bg-[#0E1015] border-2 border-[#CDCDCF]/60 shadow-2xl min-h-[640px] flex flex-col justify-between select-none cursor-crosshair"
      >
        {/* PARALLAX LAYER 1: Deep Cage Wire Mesh / Rejas UFC Background */}
        <div
          className="absolute inset-0 ufc-cage-mesh transition-transform duration-300 ease-out"
          style={{
            transform: `scale(1.1) translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`,
          }}
        />

        {/* PARALLAX LAYER 2: UFC Octagon Lighting & Red / Blue Corner Spotlights */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -18}px)`,
          }}
        >
          {/* Red Corner Spotlight */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#EC4D25]/30 rounded-full blur-[100px]" />
          {/* Blue Corner Spotlight */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#2BCFCE]/30 rounded-full blur-[100px]" />
          {/* Center Arena Beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-96 bg-white/5 rounded-full blur-[120px]" />
        </div>

        {/* PARALLAX LAYER 3: Forefront Octagon Chain-link Fence Texture Overlay */}
        <div
          className="absolute inset-0 ufc-cage-metal-overlay opacity-30 pointer-events-none transition-transform duration-200 ease-out"
          style={{
            transform: `scale(1.05) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
          }}
        />

        {/* Stage Header Info */}
        <div className="relative z-20 px-6 sm:px-8 py-5 bg-gradient-to-b from-black/80 to-transparent flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-widest sports-skew">
              <span className="sports-unskew">
                {currentMatch?.isMainEvent ? 'EVENTO ESTELAR' : currentMatch?.isCoMain ? 'CO-ESTELAR' : 'CARTELERA UFC'}
              </span>
            </span>
            <span className="text-white font-sport font-bold text-sm tracking-wider uppercase">
              {currentMatch?.weightClass || 'Catchweight (155 lbs)'} • {currentMatch?.roundsMax || 3} ROUNDS
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-sport text-[#CDCDCF] uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#2BCFCE]" />
            <span>Mover el cursor para controlar el efecto 3D Parallax</span>
          </div>
        </div>

        {/* CAREO CENTER SHOWDOWN: Red Fighter vs Blue Fighter + Tale of the Tape */}
        <div className="relative z-20 px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
          {/* RED FIGHTER (Left Corner) */}
          <div
            className="lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 20}px)`,
            }}
          >
            {/* Fighter Headshot Frame with Red Corner Glow */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl p-1.5 bg-gradient-to-b from-[#EC4D25] via-[#91250C] to-[#250802] border-3 border-[#EC4D25] shadow-2xl shadow-[#EC4D25]/40 glow-coral sports-skew group">
              <img
                src={red?.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                alt={red?.displayName || 'Red Corner Fighter'}
                className="w-full h-full object-cover object-top rounded-xl sports-unskew filter contrast-110 drop-shadow-2xl"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-[10px] uppercase tracking-widest sports-unskew">
                ROJO
              </div>
            </div>

            {/* Fighter Info */}
            <div className="mt-4 space-y-1">
              <span className="text-xs font-black tracking-widest text-[#EC4D25] font-sport uppercase">
                {red?.country || 'Red Corner'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-wide leading-none">
                {red?.displayName || 'Red Fighter'}
              </h3>
              {red?.nickname && (
                <p className="text-sm font-sport font-bold text-[#EC4D25] italic tracking-wider">
                  "{red.nickname}"
                </p>
              )}
              <p className="text-sm font-sport font-black text-[#CDCDCF] tracking-wider">
                RÉCORD: <span className="text-white text-base">{redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}</span>
              </p>
              {redGym && (
                <span className="inline-block text-[11px] font-sport font-bold text-[#939599] uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded border border-white/10 mt-1">
                  {redGym.name}
                </span>
              )}
            </div>

            {/* Red Odds Box */}
            <div className="mt-4 w-full max-w-[220px] p-3 rounded-xl bg-gradient-to-b from-[#220B06] to-[#0E1015] border-2 border-[#EC4D25]/80 shadow-lg">
              <span className="text-[10px] font-sport font-bold text-[#CDCDCF] uppercase tracking-wider block">
                MOMIO DE APUESTA
              </span>
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-2xl font-black text-[#EC4D25] font-sport">
                  {redOddAmerican}
                </span>
                <span className="text-sm font-bold text-white font-sport">
                  ({redOddDecimal}x)
                </span>
              </div>
              <div className="text-[11px] font-sport font-bold text-[#CDCDCF] mt-0.5">
                Probabilidad: <span className="text-[#EC4D25] font-black">{redProb}%</span>
              </div>
            </div>
          </div>

          {/* CENTER: COMPARATIVE TALE OF THE TAPE & ODDS METER */}
          <div
            className="lg:col-span-4 flex flex-col items-center bg-[#151821]/95 p-5 rounded-2xl border-2 border-white/10 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
            }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="w-5 h-5 text-[#E5A93C]" />
              <span className="text-lg font-black text-white font-display uppercase tracking-wider">
                TALE OF THE TAPE
              </span>
            </div>

            {/* Win Probability Bar */}
            <div className="w-full mb-5 bg-black/60 p-3 rounded-xl border border-white/10">
              <div className="flex justify-between text-xs font-sport font-black uppercase tracking-wider mb-1.5">
                <span className="text-[#EC4D25]">{red?.displayName?.split(' ').pop()} {redProb}%</span>
                <span className="text-[#939599]">PROBABILIDAD</span>
                <span className="text-[#2BCFCE]">{blueProb}% {blue?.displayName?.split(' ').pop()}</span>
              </div>
              <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#EC4D25] transition-all duration-500 shadow-lg shadow-[#EC4D25]/50"
                  style={{ width: `${redProb}%` }}
                />
                <div
                  className="h-full bg-[#2BCFCE] transition-all duration-500 shadow-lg shadow-[#2BCFCE]/50"
                  style={{ width: `${blueProb}%` }}
                />
              </div>
            </div>

            {/* Key Comparison Metrics */}
            <div className="w-full space-y-2.5 text-xs font-sport">
              {/* Height */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="font-black text-white text-sm w-16 text-left">{redStats?.height || '5\' 11"'}</span>
                <span className="text-[#939599] font-bold uppercase tracking-wider">ALTURA</span>
                <span className="font-black text-white text-sm w-16 text-right">{blueStats?.height || '6\' 0"'}</span>
              </div>

              {/* Reach */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="font-black text-white text-sm w-16 text-left">{redStats?.reach || '75 in'}</span>
                <span className="text-[#939599] font-bold uppercase tracking-wider">ALCANCE</span>
                <span className="font-black text-white text-sm w-16 text-right">{blueStats?.reach || '74 in'}</span>
              </div>

              {/* Stance */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="font-black text-[#EC4D25] text-xs w-20 text-left truncate">{redStats?.stance || 'Orthodox'}</span>
                <span className="text-[#939599] font-bold uppercase tracking-wider">GUARDIA</span>
                <span className="font-black text-[#2BCFCE] text-xs w-20 text-right truncate">{blueStats?.stance || 'Southpaw'}</span>
              </div>

              {/* Striking Accuracy */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="font-black text-white text-sm w-16 text-left">{redStats?.strikingAccuracy ? `${redStats.strikingAccuracy}%` : '58%'}</span>
                <span className="text-[#939599] font-bold uppercase tracking-wider">PRECISIÓN GOLPEO</span>
                <span className="font-black text-white text-sm w-16 text-right">{blueStats?.strikingAccuracy ? `${blueStats.strikingAccuracy}%` : '52%'}</span>
              </div>

              {/* Takedown Defense */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="font-black text-white text-sm w-16 text-left">{redStats?.takedownDefense ? `${redStats.takedownDefense}%` : '75%'}</span>
                <span className="text-[#939599] font-bold uppercase tracking-wider">DEFENSA DERRIBO</span>
                <span className="font-black text-white text-sm w-16 text-right">{blueStats?.takedownDefense ? `${blueStats.takedownDefense}%` : '80%'}</span>
              </div>
            </div>

            {/* Betting Provider Tag */}
            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-[10px] font-sport text-[#939599] uppercase tracking-wider">
              <span>MOMIOS: DRAFTKINGS / ESPN BET</span>
              <span className="text-[#2BCFCE] font-bold">ACTUALIZADO EN VIVO</span>
            </div>
          </div>

          {/* BLUE FIGHTER (Right Corner) */}
          <div
            className="lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePos.x * -35}px, ${mousePos.y * 20}px)`,
            }}
          >
            {/* Fighter Headshot Frame with Blue Corner Glow */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl p-1.5 bg-gradient-to-b from-[#2BCFCE] via-[#0D5B5A] to-[#041E1E] border-3 border-[#2BCFCE] shadow-2xl shadow-[#2BCFCE]/40 glow-turquoise sports-skew group">
              <img
                src={blue?.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                alt={blue?.displayName || 'Blue Corner Fighter'}
                className="w-full h-full object-cover object-top rounded-xl sports-unskew filter contrast-110 drop-shadow-2xl"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#2BCFCE] text-[#0E1015] font-sport font-black text-[10px] uppercase tracking-widest sports-unskew">
                AZUL
              </div>
            </div>

            {/* Fighter Info */}
            <div className="mt-4 space-y-1">
              <span className="text-xs font-black tracking-widest text-[#2BCFCE] font-sport uppercase">
                {blue?.country || 'Blue Corner'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-wide leading-none">
                {blue?.displayName || 'Blue Fighter'}
              </h3>
              {blue?.nickname && (
                <p className="text-sm font-sport font-bold text-[#2BCFCE] italic tracking-wider">
                  "{blue.nickname}"
                </p>
              )}
              <p className="text-sm font-sport font-black text-[#CDCDCF] tracking-wider">
                RÉCORD: <span className="text-white text-base">{blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}</span>
              </p>
              {blueGym && (
                <span className="inline-block text-[11px] font-sport font-bold text-[#939599] uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded border border-white/10 mt-1">
                  {blueGym.name}
                </span>
              )}
            </div>

            {/* Blue Odds Box */}
            <div className="mt-4 w-full max-w-[220px] p-3 rounded-xl bg-gradient-to-b from-[#061F1F] to-[#0E1015] border-2 border-[#2BCFCE]/80 shadow-lg">
              <span className="text-[10px] font-sport font-bold text-[#CDCDCF] uppercase tracking-wider block">
                MOMIO DE APUESTA
              </span>
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-2xl font-black text-[#2BCFCE] font-sport">
                  {blueOddAmerican}
                </span>
                <span className="text-sm font-bold text-white font-sport">
                  ({blueOddDecimal}x)
                </span>
              </div>
              <div className="text-[11px] font-sport font-bold text-[#CDCDCF] mt-0.5">
                Probabilidad: <span className="text-[#2BCFCE] font-black">{blueProb}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Selector */}
        <div className="relative z-20 px-6 py-3 bg-black/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-sport">
          <div className="flex items-center space-x-2 text-[#CDCDCF]">
            <Flame className="w-4 h-4 text-[#EC4D25]" />
            <span>Pelea seleccionada: <b className="text-white">{currentMatch?.title}</b></span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[#939599]">Pelea {selectedIndex + 1} de {displayMatches.length}</span>
            <button
              onClick={handleNextMatch}
              className="px-3 py-1 rounded bg-[#EC4D25] hover:bg-[#d63f19] text-white font-bold uppercase tracking-wider transition-colors sports-skew"
            >
              <span className="sports-unskew">Siguiente Combate &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
