'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Swords,
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Target,
  Shield,
  Ruler,
  TrendingUp,
} from 'lucide-react';
import { Match, FighterStats } from '../core/domain/types';
import { FighterAvatar } from './FighterAvatar';
import { FighterHistoryModal } from './FighterHistoryModal';
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<{ id: string; name: string } | null>(null);

  const [redImgError, setRedImgError] = useState(false);
  const [blueImgError, setBlueImgError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  // Reiniciar a la primera pelea y estados de imagen si cambia la lista
  useEffect(() => {
    setSelectedIndex(0);
  }, [matches]);

  useEffect(() => {
    setRedImgError(false);
    setBlueImgError(false);
  }, [selectedIndex]);

  // Transición suave entre combates
  const goToMatch = useCallback((index: number) => {
    if (index < 0 || index >= displayMatches.length || index === selectedIndex) return;
    setIsTransitioning(true);
    setSelectedIndex(index);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 220);
  }, [displayMatches.length, selectedIndex]);

  const handleNextMatch = useCallback(() => {
    if (displayMatches.length <= 1) return;
    goToMatch((selectedIndex + 1) % displayMatches.length);
  }, [displayMatches.length, selectedIndex, goToMatch]);

  const handlePrevMatch = useCallback(() => {
    if (displayMatches.length <= 1) return;
    goToMatch((selectedIndex - 1 + displayMatches.length) % displayMatches.length);
  }, [displayMatches.length, selectedIndex, goToMatch]);

  // Soporte de navegación con flechas del teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedFighter) return; // Si hay modal abierto no interferir
      if (e.key === 'ArrowRight') {
        handleNextMatch();
      } else if (e.key === 'ArrowLeft') {
        handlePrevMatch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextMatch, handlePrevMatch, selectedFighter]);

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
  const reachDiff = (redReachIn && blueReachIn) ? Math.round((redReachIn - blueReachIn) * 10) / 10 : 0;
  const reachAdv =
    redReachIn && blueReachIn
      ? redReachIn > blueReachIn
        ? 'RED'
        : blueReachIn > redReachIn
        ? 'BLUE'
        : 'EQUAL'
      : 'NONE';

  const redAcc = redStats?.strikingAccuracy || 54;
  const blueAcc = blueStats?.strikingAccuracy || 50;
  const accAdv =
    redAcc > blueAcc ? 'RED' : blueAcc > redAcc ? 'BLUE' : 'EQUAL';

  const redDef = redStats?.takedownDefense || 75;
  const blueDef = blueStats?.takedownDefense || 78;
  const defAdv =
    redDef > blueDef ? 'RED' : blueDef > redDef ? 'BLUE' : 'EQUAL';

  // Manejo de Parallax 3D mediante Mouse Coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Gestos táctiles en teléfonos
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) handleNextMatch();
      else handlePrevMatch();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!currentMatch) return null;

  const redAvatar =
    red?.avatarUrl && !red.avatarUrl.includes('default.png') && !redImgError
      ? red.avatarUrl
      : null;

  const blueAvatar =
    blue?.avatarUrl && !blue.avatarUrl.includes('default.png') && !blueImgError
      ? blue.avatarUrl
      : null;

  return (
    <section id="careo-paralax" className="w-full scroll-mt-20">
      {/* TARJETA PRINCIPAL DEL CAREO CON PARALLAX 3D */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#07090E] border border-white/15 shadow-2xl min-h-[580px] sm:min-h-[610px] md:min-h-[640px] flex flex-col justify-between select-none text-white transition-shadow duration-500"
        style={{ perspective: '1400px' }}
      >
        {/* ========================================================================= */}
        {/* 1. FONDO PARALLAX MULTICAPA CON IMAGEN OFICIAL Y EFECTOS DE ARENA         */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-300 ease-out"
          style={{
            backgroundImage: "url('/images/fondo_parallax.jpeg')",
            transform: `scale(1.1) translate3d(${mousePos.x * 22}px, ${mousePos.y * 14}px, 0)`,
          }}
        >
          {/* Sombreado de alto contraste para el octágono */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/75 to-[#07090E]/85" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#07090E]/60 to-[#07090E]" />
        </div>

        {/* Resplandores Neón de Esquinas (Rojo vs Azul) con Parallax Inverso */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -24}px, ${mousePos.y * -16}px, 0)`,
          }}
        >
          <div className="absolute -top-12 -left-12 w-[480px] h-[480px] bg-gradient-to-br from-[#EC4D25]/25 via-red-600/10 to-transparent rounded-full blur-[110px]" />
          <div className="absolute -top-12 -right-12 w-[480px] h-[480px] bg-gradient-to-bl from-[#2BCFCE]/25 via-cyan-600/10 to-transparent rounded-full blur-[110px]" />
        </div>

        {/* Viñeta para difuminar bordes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/60 pointer-events-none z-[3]" />

        {/* ========================================================================= */}
        {/* 2. CABECERA LIMPIA Y UNIFICADA (Selector de Combates + Controles)          */}
        {/* ========================================================================= */}
        <header className="relative z-20 px-4 sm:px-6 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EC4D25] text-white flex items-center justify-center shadow-md shadow-[#EC4D25]/30">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wider">
                  CAREO OFICIAL • UFC
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-sport font-black uppercase tracking-wider ${
                    currentMatch.isMainEvent
                      ? 'bg-[#EC4D25] text-white shadow-sm'
                      : currentMatch.isCoMain
                      ? 'bg-[#2BCFCE] text-[#07090E]'
                      : 'bg-white/15 text-slate-200'
                  }`}
                >
                  {currentMatch.isMainEvent
                    ? 'ESTELAR'
                    : currentMatch.isCoMain
                    ? 'CO-ESTELAR'
                    : `PELEA #${selectedIndex + 1}`}
                </span>
                {currentMatch.isTitleFight && (
                  <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sport font-black text-[10px] uppercase">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>CINTURÓN</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] font-sport font-bold text-slate-300 uppercase tracking-wider">
                {currentMatch.weightClass || 'Peso Oficial'} • {currentMatch.roundsMax || 3} ROUNDS
              </p>
            </div>
          </div>

          {/* Selector de combates por píldoras */}
          <div className="hidden md:flex items-center space-x-1 overflow-x-auto max-w-md lg:max-w-xl p-1 bg-white/5 rounded-xl border border-white/10">
            {displayMatches.map((m, idx) => {
              const rName = m.participants?.[0]?.participant?.displayName?.split(' ').pop() || `#${idx + 1}`;
              const bName = m.participants?.[1]?.participant?.displayName?.split(' ').pop() || '';
              const isActive = selectedIndex === idx;
              return (
                <button
                  key={m.id || idx}
                  onClick={() => goToMatch(idx)}
                  className={`px-2.5 py-1 rounded-lg font-sport font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#EC4D25] text-white shadow-md shadow-[#EC4D25]/30 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${m.title || `${rName} vs ${bName}`}`}
                >
                  {m.isMainEvent ? '★ ' : ''}
                  {rName} vs {bName}
                </button>
              );
            })}
          </div>

          {/* Flechas de Navegación + Contador */}
          <div className="flex items-center space-x-2 bg-white/10 p-1 rounded-xl border border-white/15">
            <button
              onClick={handlePrevMatch}
              className="p-1.5 rounded-lg text-slate-200 hover:bg-[#EC4D25] hover:text-white transition-colors"
              title="Combate anterior (←)"
              aria-label="Combate anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-sport font-black text-xs text-white whitespace-nowrap">
              {selectedIndex + 1} / {displayMatches.length}
            </span>
            <button
              onClick={handleNextMatch}
              className="p-1.5 rounded-lg text-slate-200 hover:bg-[#EC4D25] hover:text-white transition-colors"
              title="Siguiente combate (→)"
              aria-label="Siguiente combate"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. ESCENARIO CENTRAL DEL CAREO: PELEADORES 3D + TALE OF THE TAPE           */}
        {/* ========================================================================= */}
        <div
          className={`relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center px-4 sm:px-6 lg:px-8 py-4 gap-4 transition-all duration-300 ${
            isTransitioning ? 'opacity-40 scale-98 blur-[1px]' : 'opacity-100 scale-100 blur-0'
          }`}
        >
          {/* ESQUINA ROJA (Left: Peleador a Gran Escala con Parallax) */}
          <div
            className="lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out order-2 lg:order-1"
            style={{
              transform: `translate3d(${mousePos.x * 26}px, ${mousePos.y * 14}px, 35px) rotateY(${mousePos.x * 8}deg)`,
            }}
          >
            {/* Imagen de Gran Presencia o Avatar */}
            <div
              onClick={() => red && setSelectedFighter({ id: red.id, name: red.displayName })}
              className="relative cursor-pointer group flex flex-col items-center"
              title={`Ver perfil y estadísticas de ${red?.displayName}`}
            >
              {redAvatar ? (
                <div className="relative w-44 sm:w-52 md:w-60 lg:w-64 h-52 sm:h-60 md:h-64 flex items-end justify-center">
                  <div className="absolute inset-0 bg-[#EC4D25]/15 rounded-full blur-2xl group-hover:bg-[#EC4D25]/25 transition-all" />
                  <img
                    src={redAvatar}
                    alt={red?.displayName || 'Peleador Rojo'}
                    onError={() => setRedImgError(true)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <FighterAvatar
                  src={red?.avatarUrl}
                  name={red?.displayName || 'Rojo'}
                  country={red?.country || redGym?.country}
                  side="RED_CORNER"
                  size="2xl"
                  className="ring-4 ring-[#EC4D25]/50 shadow-2xl group-hover:scale-105 transition-transform"
                />
              )}

              <span className="absolute top-0 left-2 px-2.5 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-[10px] uppercase shadow-md tracking-wider">
                ESQUINA ROJA
              </span>
            </div>

            {/* Datos del Peleador Rojo */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-center space-x-1.5">
                {redFlag && (
                  <img src={redFlag} alt="" className="w-4 h-3 object-cover rounded-xs shadow-xs" />
                )}
                <span className="text-[10px] font-black tracking-widest text-[#EC4D25] font-sport uppercase">
                  {red?.country || 'UFC'}
                </span>
              </div>
              <h3
                onClick={() => red && setSelectedFighter({ id: red.id, name: red.displayName })}
                className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide leading-none truncate max-w-[260px] cursor-pointer hover:text-[#EC4D25] hover:underline transition-colors"
                title={`Ver perfil de ${red?.displayName}`}
              >
                {red?.displayName || 'Peleador'}
              </h3>
              {red?.nickname && (
                <p className="text-xs font-sport font-bold text-[#EC4D25] italic tracking-wide">
                  "{red.nickname}"
                </p>
              )}
              <p className="text-xs font-sport font-bold text-slate-300">
                RÉCORD: <span className="text-white font-black">{redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}</span>
              </p>
              {redGym && (
                <span className="inline-block text-[10px] font-sport font-bold text-slate-400 uppercase bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 truncate max-w-[210px]">
                  {redGym.name}
                </span>
              )}
            </div>

            {/* Momios Rojo */}
            <div className="mt-2.5 w-full max-w-[200px] p-2 rounded-xl bg-gradient-to-b from-[#EC4D25]/20 to-black/60 border border-[#EC4D25]/40 shadow-lg text-center backdrop-blur-sm">
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

          {/* CENTRO: TALE OF THE TAPE FLOTANTE CON PARALLAX 3D */}
          <div
            className="lg:col-span-4 flex flex-col items-center bg-[#0C0F17]/95 p-4 sm:p-5 rounded-2xl md:rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl transition-transform duration-300 ease-out order-1 lg:order-2"
            style={{
              transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -10}px, 20px) rotateX(${mousePos.y * -6}deg)`,
            }}
          >
            <div className="flex items-center space-x-2 mb-2.5">
              <Trophy className="w-4 h-4 text-[#E5A93C]" />
              <span className="text-xs sm:text-sm font-black text-white font-display uppercase tracking-wider">
                TALE OF THE TAPE • COMPARATIVA
              </span>
            </div>

            {/* Barra de Probabilidad Comparativa */}
            <div className="w-full mb-3 bg-black/60 p-2.5 rounded-xl border border-white/10">
              <div className="flex justify-between text-[11px] font-sport font-black uppercase mb-1.5">
                <span className="text-[#EC4D25] flex items-center space-x-1">
                  <span>{red?.displayName?.split(' ').pop()}</span>
                  <span className="bg-[#EC4D25]/25 px-1 rounded text-[10px]">{redProb}%</span>
                </span>
                <span className="text-slate-400 text-[9px] flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-[#E5A93C]" />
                  <span>VICTORIA</span>
                </span>
                <span className="text-[#2BCFCE] flex items-center space-x-1">
                  <span className="bg-[#2BCFCE]/25 px-1 rounded text-[10px] text-[#2BCFCE]">{blueProb}%</span>
                  <span>{blue?.displayName?.split(' ').pop()}</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex ring-1 ring-white/10 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-[#EC4D25] transition-all duration-500 shadow-md shadow-[#EC4D25]/50"
                  style={{ width: `${redProb}%` }}
                />
                <div
                  className="h-full bg-gradient-to-l from-cyan-600 to-[#2BCFCE] transition-all duration-500 shadow-md shadow-[#2BCFCE]/50"
                  style={{ width: `${blueProb}%` }}
                />
              </div>
            </div>

            {/* Métricas Comparativas con Indicadores de Ventaja */}
            <div className="w-full space-y-1.5 text-xs font-sport">
              {/* Estatura */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/5">
                <span className={`w-16 text-left font-black ${heightAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                  {redStats?.height || '5\' 11"'}
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                  <Ruler className="w-3 h-3 text-slate-400" />
                  <span>ESTATURA</span>
                </span>
                <span className={`w-16 text-right font-black ${heightAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                  {blueStats?.height || '6\' 0"'}
                </span>
              </div>

              {/* Alcance / Envergadura con diferencial */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/5">
                <div className="w-18 flex items-center space-x-1 justify-start">
                  <span className={`font-black ${reachAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                    {redStats?.reach || '74"'}
                  </span>
                  {reachDiff > 0 && (
                    <span className="px-1 py-0.2 rounded bg-[#EC4D25] text-white text-[8px] font-black">
                      +{reachDiff}"
                    </span>
                  )}
                </div>

                <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                  <Target className="w-3 h-3 text-slate-400" />
                  <span>ALCANCE</span>
                </span>

                <div className="w-18 flex items-center space-x-1 justify-end">
                  {reachDiff < 0 && (
                    <span className="px-1 py-0.2 rounded bg-[#2BCFCE] text-[#07090E] text-[8px] font-black">
                      +{Math.abs(reachDiff)}"
                    </span>
                  )}
                  <span className={`font-black ${reachAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                    {blueStats?.reach || '74"'}
                  </span>
                </div>
              </div>

              {/* Guardia */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/5">
                <span className="w-20 text-left font-bold text-[#EC4D25] text-[11px] truncate uppercase">
                  {redStats?.stance || 'Orthodox'}
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase">GUARDIA</span>
                <span className="w-20 text-right font-bold text-[#2BCFCE] text-[11px] truncate uppercase">
                  {blueStats?.stance || 'Southpaw'}
                </span>
              </div>

              {/* Precisión de Golpeo */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/5">
                <span className={`w-16 text-left font-black ${accAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                  {redAcc}%
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase">PRECISIÓN GOLPEO</span>
                <span className={`w-16 text-right font-black ${accAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                  {blueAcc}%
                </span>
              </div>

              {/* Defensa de Derribo */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/5">
                <span className={`w-16 text-left font-black ${defAdv === 'RED' ? 'text-[#EC4D25]' : 'text-white'}`}>
                  {redDef}%
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span>DEF. DERRIBO</span>
                </span>
                <span className={`w-16 text-right font-black ${defAdv === 'BLUE' ? 'text-[#2BCFCE]' : 'text-white'}`}>
                  {blueDef}%
                </span>
              </div>
            </div>
          </div>

          {/* ESQUINA AZUL (Right: Peleador a Gran Escala con Parallax) */}
          <div
            className="lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out order-3"
            style={{
              transform: `translate3d(${mousePos.x * -26}px, ${mousePos.y * 14}px, 35px) rotateY(${mousePos.x * 8}deg)`,
            }}
          >
            {/* Imagen de Gran Presencia o Avatar */}
            <div
              onClick={() => blue && setSelectedFighter({ id: blue.id, name: blue.displayName })}
              className="relative cursor-pointer group flex flex-col items-center"
              title={`Ver perfil y estadísticas de ${blue?.displayName}`}
            >
              {blueAvatar ? (
                <div className="relative w-44 sm:w-52 md:w-60 lg:w-64 h-52 sm:h-60 md:h-64 flex items-end justify-center">
                  <div className="absolute inset-0 bg-[#2BCFCE]/15 rounded-full blur-2xl group-hover:bg-[#2BCFCE]/25 transition-all" />
                  <img
                    src={blueAvatar}
                    alt={blue?.displayName || 'Peleador Azul'}
                    onError={() => setBlueImgError(true)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <FighterAvatar
                  src={blue?.avatarUrl}
                  name={blue?.displayName || 'Azul'}
                  country={blue?.country || blueGym?.country}
                  side="BLUE_CORNER"
                  size="2xl"
                  className="ring-4 ring-[#2BCFCE]/50 shadow-2xl group-hover:scale-105 transition-transform"
                />
              )}

              <span className="absolute top-0 right-2 px-2.5 py-0.5 rounded bg-[#2BCFCE] text-[#07090E] font-sport font-black text-[10px] uppercase shadow-md tracking-wider">
                ESQUINA AZUL
              </span>
            </div>

            {/* Datos del Peleador Azul */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-center space-x-1.5">
                {blueFlag && (
                  <img src={blueFlag} alt="" className="w-4 h-3 object-cover rounded-xs shadow-xs" />
                )}
                <span className="text-[10px] font-black tracking-widest text-[#2BCFCE] font-sport uppercase">
                  {blue?.country || 'UFC'}
                </span>
              </div>
              <h3
                onClick={() => blue && setSelectedFighter({ id: blue.id, name: blue.displayName })}
                className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide leading-none truncate max-w-[260px] cursor-pointer hover:text-[#2BCFCE] hover:underline transition-colors"
                title={`Ver perfil de ${blue?.displayName}`}
              >
                {blue?.displayName || 'Peleador'}
              </h3>
              {blue?.nickname && (
                <p className="text-xs font-sport font-bold text-[#2BCFCE] italic tracking-wide">
                  "{blue.nickname}"
                </p>
              )}
              <p className="text-xs font-sport font-bold text-slate-300">
                RÉCORD: <span className="text-white font-black">{blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}</span>
              </p>
              {blueGym && (
                <span className="inline-block text-[10px] font-sport font-bold text-slate-400 uppercase bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 truncate max-w-[210px]">
                  {blueGym.name}
                </span>
              )}
            </div>

            {/* Momios Azul */}
            <div className="mt-2.5 w-full max-w-[200px] p-2 rounded-xl bg-gradient-to-b from-[#2BCFCE]/20 to-black/60 border border-[#2BCFCE]/40 shadow-lg text-center backdrop-blur-sm">
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
        {/* 4. BARRA INFERIOR DISCRETA Y ELEGANTE (Título y Paginación de puntos)     */}
        {/* ========================================================================= */}
        <footer className="relative z-20 px-4 sm:px-6 py-2.5 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-xs font-sport">
          <div className="flex items-center space-x-2 truncate">
            <Flame className="w-3.5 h-3.5 text-[#EC4D25] shrink-0" />
            <span className="text-slate-200 font-bold truncate">
              {currentMatch?.title || `${red?.displayName} vs ${blue?.displayName}`}
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {displayMatches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToMatch(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  selectedIndex === idx
                    ? 'w-6 bg-[#EC4D25] shadow-sm shadow-[#EC4D25]/50'
                    : 'w-1.5 bg-white/20 hover:bg-white/50'
                }`}
                aria-label={`Ver combate ${idx + 1}`}
                title={`Pelea #${idx + 1}`}
              />
            ))}
          </div>
        </footer>
      </div>

      {/* Modal de Historial de Combates al hacer clic sobre cualquier peleador */}
      <FighterHistoryModal
        fighterId={selectedFighter?.id || null}
        fighterName={selectedFighter?.name}
        isOpen={!!selectedFighter}
        onClose={() => setSelectedFighter(null)}
      />
    </section>
  );
}
