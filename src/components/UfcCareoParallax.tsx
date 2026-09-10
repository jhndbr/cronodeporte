'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Swords, Flame, Trophy, ChevronLeft, ChevronRight, Zap, Target, Shield, Ruler } from 'lucide-react';
import { Match, FighterStats } from '../core/domain/types';
import { FighterAvatar } from './FighterAvatar';
import { getCountryFlagUrl } from '@/utils/country-flags';

interface UfcCareoParallaxProps {
  matches: Match[];
  initialMatchIndex?: number;
}

// Helpers para calcular ventajas físicas
function parseInches(str?: string): number | null {
  if (!str) return null;
  const match = str.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function parseHeightInches(str?: string): number | null {
  if (!str) return null;
  const match = str.match(/(\d+)'\s*(\d+)?/);
  if (match) {
    const feet = parseInt(match[1], 10);
    const inches = match[2] ? parseInt(match[2], 10) : 0;
    return feet * 12 + inches;
  }
  return parseInches(str);
}

export function UfcCareoParallax({ matches, initialMatchIndex = 0 }: UfcCareoParallaxProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialMatchIndex);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const displayMatches = matches && matches.length > 0 ? matches : [];
  const currentMatch = displayMatches[selectedIndex] || displayMatches[0];

  const redParticipant = currentMatch?.participants?.find((p) => p.side === 'RED_CORNER');
  const blueParticipant = currentMatch?.participants?.find((p) => p.side === 'BLUE_CORNER');

  const red = redParticipant?.participant;
  const blue = blueParticipant?.participant;

  const redStats = red?.stats as FighterStats | undefined;
  const blueStats = blue?.stats as FighterStats | undefined;

  const redGym = red?.affiliations?.[0]?.affiliation;
  const blueGym = blue?.affiliations?.[0]?.affiliation;

  const redFlag = red ? getCountryFlagUrl(red.country || redGym?.country, red.displayName) : null;
  const blueFlag = blue ? getCountryFlagUrl(blue.country || blueGym?.country, blue.displayName) : null;

  // Reiniciar a la primera pelea si cambia la lista
  useEffect(() => {
    setSelectedIndex(0);
  }, [matches]);

  // Momios y Probabilidad Implícita
  const redOddAmerican = redParticipant?.currentOdd?.american || '-135';
  const blueOddAmerican = blueParticipant?.currentOdd?.american || '+115';
  const redOddDecimal = redParticipant?.currentOdd?.decimal || 1.74;
  const blueOddDecimal = blueParticipant?.currentOdd?.decimal || 2.15;

  const redProb = Math.round(
    redOddDecimal > 0 ? (1 / redOddDecimal) * 100 : 54
  );
  const blueProb = Math.max(10, Math.min(90, 100 - redProb));

  // Ventajas físicas comparativas
  const redHeightIn = parseHeightInches(redStats?.height);
  const blueHeightIn = parseHeightInches(blueStats?.height);
  const heightAdv =
    redHeightIn && blueHeightIn
      ? redHeightIn > blueHeightIn
        ? 'RED'
        : blueHeightIn > redHeightIn
        ? 'BLUE'
        : 'EQUAL'
      : 'NONE';

  const redReachIn = parseInches(redStats?.reach);
  const blueReachIn = parseInches(blueStats?.reach);
  const reachAdv =
    redReachIn && blueReachIn
      ? redReachIn > blueReachIn
        ? 'RED'
        : blueReachIn > redReachIn
        ? 'BLUE'
        : 'EQUAL'
      : 'NONE';

  const redAcc = redStats?.strikingAccuracy || 0;
  const blueAcc = blueStats?.strikingAccuracy || 0;
  const accAdv =
    redAcc && blueAcc
      ? redAcc > blueAcc
        ? 'RED'
        : blueAcc > redAcc
        ? 'BLUE'
        : 'EQUAL'
      : 'NONE';

  const redDef = redStats?.takedownDefense || 0;
  const blueDef = blueStats?.takedownDefense || 0;
  const defAdv =
    redDef && blueDef
      ? redDef > blueDef
        ? 'RED'
        : blueDef > redDef
        ? 'BLUE'
        : 'EQUAL'
      : 'NONE';

  // Scroll Tracking para fijación y cambio de peleadores
  useEffect(() => {
    if (displayMatches.length <= 1) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!trackRef.current) return;
          const rect = trackRef.current.getBoundingClientRect();
          const stickyTop = window.innerWidth < 768 ? 64 : 80;
          const scrollDistance = rect.height - window.innerHeight;

          if (scrollDistance > 0) {
            const scrolled = stickyTop - rect.top;
            const progress = Math.min(1, Math.max(0, scrolled / scrollDistance));
            const newIndex = Math.min(
              displayMatches.length - 1,
              Math.floor(progress * displayMatches.length)
            );
            setSelectedIndex((prev) => (prev !== newIndex ? newIndex : prev));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayMatches.length]);

  const goToMatch = (index: number) => {
    if (index < 0 || index >= displayMatches.length) return;
    setSelectedIndex(index);

    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const stickyTop = window.innerWidth < 768 ? 64 : 80;
      const scrollDistance = trackRef.current.offsetHeight - window.innerHeight;

      if (scrollDistance > 0) {
        const targetScroll =
          trackTop - stickyTop + ((index + 0.35) / displayMatches.length) * scrollDistance;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  };

  const handleNextMatch = () => {
    if (displayMatches.length === 0) return;
    goToMatch((selectedIndex + 1) % displayMatches.length);
  };

  const handlePrevMatch = () => {
    if (displayMatches.length === 0) return;
    goToMatch((selectedIndex - 1 + displayMatches.length) % displayMatches.length);
  };

  // Deslizamiento táctil para celulares (Swipe horizontal)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) handleNextMatch();
      else handlePrevMatch();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!currentMatch) return null;

  const trackHeight =
    displayMatches.length > 1
      ? `calc(100vh + ${(displayMatches.length - 1) * 32}vh)`
      : 'auto';

  return (
    <section
      id="careo-paralax"
      ref={trackRef}
      className="relative w-full"
      style={{ height: trackHeight }}
    >
      {/* Escenario anclado: se fija al entrar al viewport y va alternando peleadores */}
      <div className="sticky top-16 md:top-20 z-20 w-full py-1">
        {/* Cabecera exterior con selector y progreso */}
        <div className="flex items-center justify-between gap-3 mb-2.5 px-1 sm:px-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EC4D25] text-white flex items-center justify-center shadow-md shadow-[#EC4D25]/30">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                  CAREO OFICIAL • FACE-OFF
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-900 text-[#2BCFCE] font-sport font-black text-[10px] uppercase tracking-wider">
                  EN VIVO
                </span>
              </div>
              <p className="text-[11px] font-sport font-semibold text-[#939599] uppercase tracking-wider hidden sm:block">
                Comparativa frente a frente • Ventajas físicas y momios
              </p>
            </div>
          </div>

          {/* Navegación rápida por botones */}
          <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={handlePrevMatch}
              className="p-1 rounded-lg text-slate-700 hover:bg-[#EC4D25] hover:text-white transition-colors"
              aria-label="Combate anterior"
              title="Combate anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-sport font-black text-xs text-[#0E1015] whitespace-nowrap">
              {selectedIndex + 1} / {displayMatches.length}
            </span>
            <button
              onClick={handleNextMatch}
              className="p-1 rounded-lg text-slate-700 hover:bg-[#EC4D25] hover:text-white transition-colors"
              aria-label="Siguiente combate"
              title="Siguiente combate"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tarjeta de Careo Deportiva (Sin pantalla completa, diseño elegante de arena UFC) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-2xl md:rounded-3xl bg-[#0E1015] border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between h-[495px] md:h-[535px] text-white"
        >
          {/* Luces sutiles de fondo para ambientación de octágono */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#EC4D25]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2BCFCE]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Barra Superior: Información de la Pelea y Selector de Combates */}
          <div className="relative z-10 px-4 py-2.5 bg-black/60 backdrop-blur-md flex items-center justify-between gap-3 border-b border-white/10">
            <div className="flex items-center space-x-2 truncate">
              <span className="px-2.5 py-0.5 rounded bg-[#EC4D25] font-sport font-black text-[10px] sm:text-xs uppercase tracking-wider shrink-0 shadow-sm shadow-[#EC4D25]/30">
                {currentMatch?.isMainEvent
                  ? 'ESTELAR'
                  : currentMatch?.isCoMain
                  ? 'CO-ESTELAR'
                  : `PELEA #${selectedIndex + 1}`}
              </span>
              <span className="font-sport font-bold text-xs sm:text-sm tracking-wide uppercase truncate text-slate-200">
                {currentMatch?.weightClass || 'Peso Oficial'} • {currentMatch?.roundsMax || 3} Rounds
              </span>
              {currentMatch?.isTitleFight && (
                <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-sport font-black text-[10px] uppercase">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>CINTURÓN</span>
                </span>
              )}
            </div>

            {/* Píldoras de Combates en PC */}
            <div className="hidden lg:flex items-center space-x-1 overflow-x-auto max-w-lg p-0.5 bg-white/5 rounded-lg border border-white/10">
              {displayMatches.slice(0, 8).map((m, idx) => {
                const rName = m.participants?.[0]?.participant?.displayName?.split(' ').pop() || `#${idx + 1}`;
                const bName = m.participants?.[1]?.participant?.displayName?.split(' ').pop() || '';
                return (
                  <button
                    key={m.id || idx}
                    onClick={() => goToMatch(idx)}
                    className={`px-2.5 py-1 rounded font-sport font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-all ${
                      selectedIndex === idx
                        ? 'bg-[#EC4D25] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {m.isMainEvent ? '★ ' : ''}{rName} vs {bName}
                  </button>
                );
              })}
            </div>

            <span className="text-[10px] font-sport font-semibold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              Desliza para cambiar
            </span>
          </div>

          {/* ========================================================================= */}
          {/* PC ARENA: 3 Columnas Proporcionales (Rojo | Tale of the Tape | Azul)      */}
          {/* ========================================================================= */}
          <div className="relative z-10 hidden lg:grid lg:grid-cols-12 gap-6 items-center flex-1 px-8 py-3">
            {/* ESQUINA ROJA (Left) */}
            <div className="lg:col-span-4 flex flex-col items-center text-center transition-all duration-300">
              <div className="relative group">
                <FighterAvatar
                  src={red?.avatarUrl}
                  name={red?.displayName || 'Peleador Rojo'}
                  country={red?.country || redGym?.country}
                  side="RED_CORNER"
                  size="xl"
                  className="w-36 h-36 xl:w-40 xl:h-40 ring-4 ring-[#EC4D25]/40 shadow-xl shadow-[#EC4D25]/20"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-[10px] uppercase shadow-md">
                  ROJO
                </span>
              </div>

              <div className="mt-2.5 space-y-0.5">
                <div className="flex items-center justify-center space-x-1.5">
                  {redFlag && (
                    <img src={redFlag} alt="" className="w-4 h-3 object-cover rounded-xs shadow-xs" />
                  )}
                  <span className="text-[10px] font-black tracking-widest text-[#EC4D25] font-sport uppercase">
                    {red?.country || 'Esquina Roja'}
                  </span>
                </div>
                <h3 className="text-2xl xl:text-3xl font-black text-white font-display uppercase tracking-wide leading-none truncate max-w-[220px]">
                  {red?.displayName || 'Peleador Rojo'}
                </h3>
                {red?.nickname && (
                  <p className="text-xs font-sport font-bold text-[#EC4D25] italic">
                    "{red.nickname}"
                  </p>
                )}
                <p className="text-xs font-sport font-bold text-slate-300">
                  RÉCORD: <span className="text-white font-black">{redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}</span>
                </p>
                {redGym && (
                  <span className="inline-block text-[10px] font-sport font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10 mt-0.5 truncate max-w-[200px]">
                    {redGym.name}
                  </span>
                )}
              </div>

              {/* Caja de Momios Roja */}
              <div className="mt-2 w-full max-w-[190px] p-2 rounded-xl bg-gradient-to-b from-[#EC4D25]/20 to-black/40 border border-[#EC4D25]/40 shadow-md text-center">
                <span className="text-[9px] font-sport font-bold text-[#EC4D25] uppercase tracking-wider block">
                  MOMIO DE APUESTA
                </span>
                <div className="flex items-baseline justify-center space-x-1.5">
                  <span className="text-xl font-black text-[#EC4D25] font-sport">
                    {redOddAmerican}
                  </span>
                  <span className="text-xs font-bold text-slate-300 font-sport">
                    ({redOddDecimal}x)
                  </span>
                </div>
                <div className="text-[10px] font-sport font-bold text-slate-300">
                  Probabilidad: <span className="text-[#EC4D25] font-black">{redProb}%</span>
                </div>
              </div>
            </div>

            {/* CENTRO: TALE OF THE TAPE & PROBABILIDAD DE VICTORIA */}
            <div className="lg:col-span-4 flex flex-col items-center bg-[#151821]/95 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center space-x-1.5 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black text-white font-display uppercase tracking-wider">
                  TALE OF THE TAPE • COMPARATIVA
                </span>
              </div>

              {/* Barra de Probabilidad Comparativa */}
              <div className="w-full mb-3 bg-black/60 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px] font-sport font-black uppercase mb-1">
                  <span className="text-[#EC4D25]">{red?.displayName?.split(' ').pop()} {redProb}%</span>
                  <span className="text-slate-400 text-[9px]">PROBABILIDAD</span>
                  <span className="text-[#2BCFCE]">{blueProb}% {blue?.displayName?.split(' ').pop()}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-[#EC4D25] transition-all duration-300 shadow-md shadow-[#EC4D25]/50" style={{ width: `${redProb}%` }} />
                  <div className="h-full bg-[#2BCFCE] transition-all duration-300 shadow-md shadow-[#2BCFCE]/50" style={{ width: `${blueProb}%` }} />
                </div>
              </div>

              {/* Filas Comparativas con Indicador de Ventaja */}
              <div className="w-full space-y-1.5 text-xs font-sport">
                {/* Altura */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className={`w-16 text-left font-black ${heightAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                    {redStats?.height || '5\' 11"'}
                  </span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                    <Ruler className="w-3 h-3 text-slate-500" />
                    <span>ALTURA</span>
                  </span>
                  <span className={`w-16 text-right font-black ${heightAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                    {blueStats?.height || '6\' 0"'}
                  </span>
                </div>

                {/* Alcance */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className={`w-16 text-left font-black ${reachAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                    {redStats?.reach || '75 in'}
                  </span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                    <Target className="w-3 h-3 text-slate-500" />
                    <span>ALCANCE</span>
                  </span>
                  <span className={`w-16 text-right font-black ${reachAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                    {blueStats?.reach || '74 in'}
                  </span>
                </div>

                {/* Guardia */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="w-16 text-left font-bold text-[#EC4D25] text-[11px] truncate">
                    {redStats?.stance || 'Orthodox'}
                  </span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">GUARDIA</span>
                  <span className="w-16 text-right font-bold text-[#2BCFCE] text-[11px] truncate">
                    {blueStats?.stance || 'Southpaw'}
                  </span>
                </div>

                {/* Precisión de Golpeo */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className={`w-16 text-left font-black ${accAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                    {redStats?.strikingAccuracy ? `${redStats.strikingAccuracy}%` : '58%'}
                  </span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">PRECISIÓN</span>
                  <span className={`w-16 text-right font-black ${accAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                    {blueStats?.strikingAccuracy ? `${blueStats.strikingAccuracy}%` : '52%'}
                  </span>
                </div>

                {/* Defensa de Derribo */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className={`w-16 text-left font-black ${defAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                    {redStats?.takedownDefense ? `${redStats.takedownDefense}%` : '75%'}
                  </span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-slate-500" />
                    <span>DEF. DERRIBO</span>
                  </span>
                  <span className={`w-16 text-right font-black ${defAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                    {blueStats?.takedownDefense ? `${blueStats.takedownDefense}%` : '80%'}
                  </span>
                </div>
              </div>
            </div>

            {/* ESQUINA AZUL (Right) */}
            <div className="lg:col-span-4 flex flex-col items-center text-center transition-all duration-300">
              <div className="relative group">
                <FighterAvatar
                  src={blue?.avatarUrl}
                  name={blue?.displayName || 'Peleador Azul'}
                  country={blue?.country || blueGym?.country}
                  side="BLUE_CORNER"
                  size="xl"
                  className="w-36 h-36 xl:w-40 xl:h-40 ring-4 ring-[#2BCFCE]/40 shadow-xl shadow-[#2BCFCE]/20"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#2BCFCE] text-[#0E1015] font-sport font-black text-[10px] uppercase shadow-md">
                  AZUL
                </span>
              </div>

              <div className="mt-2.5 space-y-0.5">
                <div className="flex items-center justify-center space-x-1.5">
                  {blueFlag && (
                    <img src={blueFlag} alt="" className="w-4 h-3 object-cover rounded-xs shadow-xs" />
                  )}
                  <span className="text-[10px] font-black tracking-widest text-[#2BCFCE] font-sport uppercase">
                    {blue?.country || 'Esquina Azul'}
                  </span>
                </div>
                <h3 className="text-2xl xl:text-3xl font-black text-white font-display uppercase tracking-wide leading-none truncate max-w-[220px]">
                  {blue?.displayName || 'Peleador Azul'}
                </h3>
                {blue?.nickname && (
                  <p className="text-xs font-sport font-bold text-[#2BCFCE] italic">
                    "{blue.nickname}"
                  </p>
                )}
                <p className="text-xs font-sport font-bold text-slate-300">
                  RÉCORD: <span className="text-white font-black">{blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}</span>
                </p>
                {blueGym && (
                  <span className="inline-block text-[10px] font-sport font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10 mt-0.5 truncate max-w-[200px]">
                    {blueGym.name}
                  </span>
                )}
              </div>

              {/* Caja de Momios Azul */}
              <div className="mt-2 w-full max-w-[190px] p-2 rounded-xl bg-gradient-to-b from-[#2BCFCE]/20 to-black/40 border border-[#2BCFCE]/40 shadow-md text-center">
                <span className="text-[9px] font-sport font-bold text-[#2BCFCE] uppercase tracking-wider block">
                  MOMIO DE APUESTA
                </span>
                <div className="flex items-baseline justify-center space-x-1.5">
                  <span className="text-xl font-black text-[#2BCFCE] font-sport">
                    {blueOddAmerican}
                  </span>
                  <span className="text-xs font-bold text-slate-300 font-sport">
                    ({blueOddDecimal}x)
                  </span>
                </div>
                <div className="text-[10px] font-sport font-bold text-slate-300">
                  Probabilidad: <span className="text-[#2BCFCE] font-black">{blueProb}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MOBILE ARENA: Split Face-Off Frente a Frente (100% visible sin desbordes) */}
          {/* ========================================================================= */}
          <div className="relative z-10 lg:hidden flex flex-col justify-between flex-1 px-3 py-2 space-y-2">
            {/* Cara a Cara de Peleadores */}
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Esquina Roja */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <FighterAvatar
                    src={red?.avatarUrl}
                    name={red?.displayName || 'Rojo'}
                    country={red?.country || redGym?.country}
                    side="RED_CORNER"
                    size="md"
                    className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-[#EC4D25]"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#EC4D25] text-white font-sport font-black text-[9px] uppercase">
                    ROJO
                  </span>
                </div>
                <h4 className="text-base font-black text-white font-display uppercase tracking-wide mt-1 truncate max-w-[130px]">
                  {red?.displayName || 'Rojo'}
                </h4>
                <p className="text-[11px] font-sport font-bold text-slate-300">
                  {redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}
                </p>
                <div className="mt-1 px-2 py-0.5 rounded-lg bg-[#EC4D25]/20 border border-[#EC4D25]/50 text-xs font-black text-[#EC4D25] font-sport">
                  {redOddAmerican} ({redProb}%)
                </div>
              </div>

              {/* Esquina Azul */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <FighterAvatar
                    src={blue?.avatarUrl}
                    name={blue?.displayName || 'Azul'}
                    country={blue?.country || blueGym?.country}
                    side="BLUE_CORNER"
                    size="md"
                    className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-[#2BCFCE]"
                  />
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-[#2BCFCE] text-[#0E1015] font-sport font-black text-[9px] uppercase">
                    AZUL
                  </span>
                </div>
                <h4 className="text-base font-black text-white font-display uppercase tracking-wide mt-1 truncate max-w-[130px]">
                  {blue?.displayName || 'Azul'}
                </h4>
                <p className="text-[11px] font-sport font-bold text-slate-300">
                  {blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}
                </p>
                <div className="mt-1 px-2 py-0.5 rounded-lg bg-[#2BCFCE]/20 border border-[#2BCFCE]/50 text-xs font-black text-[#2BCFCE] font-sport">
                  {blueOddAmerican} ({blueProb}%)
                </div>
              </div>
            </div>

            {/* Barra de Probabilidad Móvil */}
            <div className="bg-black/60 p-2 rounded-xl border border-white/10">
              <div className="flex justify-between text-[10px] font-sport font-black uppercase mb-1">
                <span className="text-[#EC4D25]">{redProb}% ROJO</span>
                <span className="text-slate-400 text-[9px]">PROBABILIDAD</span>
                <span className="text-[#2BCFCE]">{blueProb}% AZUL</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-[#EC4D25]" style={{ width: `${redProb}%` }} />
                <div className="h-full bg-[#2BCFCE]" style={{ width: `${blueProb}%` }} />
              </div>
            </div>

            {/* Métricas Clave en Móvil */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-2 space-y-1 text-[11px] font-sport">
              <div className="flex justify-between items-center px-2 py-0.5 bg-black/40 rounded">
                <span className={`font-black ${heightAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                  {redStats?.height || '5\' 11"'}
                </span>
                <span className="text-slate-400 text-[9px] uppercase">ALTURA</span>
                <span className={`font-black ${heightAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                  {blueStats?.height || '6\' 0"'}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-0.5 bg-black/40 rounded">
                <span className={`font-black ${reachAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                  {redStats?.reach || '75 in'}
                </span>
                <span className="text-slate-400 text-[9px] uppercase">ALCANCE</span>
                <span className={`font-black ${reachAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                  {blueStats?.reach || '74 in'}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-0.5 bg-black/40 rounded">
                <span className="font-bold text-[#EC4D25] truncate max-w-[75px]">
                  {redStats?.stance || 'Orthodox'}
                </span>
                <span className="text-slate-400 text-[9px] uppercase">GUARDIA</span>
                <span className="font-bold text-[#2BCFCE] truncate max-w-[75px] text-right">
                  {blueStats?.stance || 'Southpaw'}
                </span>
              </div>
            </div>
          </div>

          {/* Barra Inferior: Título del Combate & Puntos de Navegación */}
          <div className="relative z-10 px-4 py-2 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-xs font-sport">
            <div className="flex items-center space-x-2 truncate">
              <Flame className="w-3.5 h-3.5 text-[#EC4D25] shrink-0" />
              <span className="text-slate-200 font-bold truncate">
                {currentMatch?.title || 'Combate UFC'}
              </span>
            </div>

            {/* Puntos de Navegación */}
            <div className="flex items-center space-x-1 shrink-0">
              {displayMatches.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToMatch(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    selectedIndex === idx
                      ? 'w-5 bg-[#EC4D25]'
                      : 'w-1.5 bg-white/20 hover:bg-white/50'
                  }`}
                  aria-label={`Ver combate ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
