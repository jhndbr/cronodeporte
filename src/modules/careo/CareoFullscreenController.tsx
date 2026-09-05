'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Trophy,
  Flame,
  Swords,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Zap,
  Target,
  Shield,
  Ruler,
} from 'lucide-react';
import { Match } from '@/core/domain/types';
import { FighterAvatar } from '@/components/FighterAvatar';
import { CareoQuickNav } from './CareoQuickNav';

interface CareoFullscreenControllerProps {
  matches: Match[];
  initialIndex?: number;
  onClose: () => void;
}

export function CareoFullscreenController({
  matches,
  initialIndex = 0,
  onClose,
}: CareoFullscreenControllerProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const deltaAccumulator = useRef(0);
  const isThrottled = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  const displayMatches = matches.length > 0 ? matches : [];
  const matchesLengthRef = useRef(displayMatches.length);
  matchesLengthRef.current = displayMatches.length;

  const currentMatch = displayMatches[selectedIndex] || displayMatches[0];

  const redParticipant = currentMatch?.participants?.find((p) => p.side === 'RED_CORNER');
  const blueParticipant = currentMatch?.participants?.find((p) => p.side === 'BLUE_CORNER');

  const red = redParticipant?.participant;
  const blue = blueParticipant?.participant;

  const redStats = red?.stats as import('@/core/domain/types').FighterStats | undefined;
  const blueStats = blue?.stats as import('@/core/domain/types').FighterStats | undefined;

  const redGym = red?.affiliations?.[0]?.affiliation;
  const blueGym = blue?.affiliations?.[0]?.affiliation;

  // Cuotas y probabilidades
  const redOddAmerican = redParticipant?.currentOdd?.american || '-135';
  const blueOddAmerican = blueParticipant?.currentOdd?.american || '+115';
  const redOddDecimal = redParticipant?.currentOdd?.decimal || 1.74;
  const blueOddDecimal = blueParticipant?.currentOdd?.decimal || 2.15;

  const redProb = Math.round(redOddDecimal > 0 ? (1 / redOddDecimal) * 100 : 55);
  const blueProb = Math.max(10, Math.min(90, 100 - redProb));

  // Cálculos de métricas numéricas para ventajas
  const parseInches = (str?: string) => {
    if (!str) return 74;
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 74;
  };

  const redReachNum = parseInches(redStats?.reach);
  const blueReachNum = parseInches(blueStats?.reach);
  const reachDiff = redReachNum - blueReachNum;

  const redAcc = redStats?.strikingAccuracy || 52;
  const blueAcc = blueStats?.strikingAccuracy || 50;

  const redTd = redStats?.takedownDefense || 75;
  const blueTd = blueStats?.takedownDefense || 78;

  // Montar Portal solo en cliente
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Transición segura de pelea
  const goToMatch = useCallback((index: number) => {
    if (index < 0 || index >= matchesLengthRef.current) return;
    setIsTransitioning(true);
    setSelectedIndex(index);
    setTimeout(() => setIsTransitioning(false), 240);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndexRef.current < matchesLengthRef.current - 1) {
      goToMatch(selectedIndexRef.current + 1);
    }
  }, [goToMatch]);

  const handlePrev = useCallback(() => {
    if (selectedIndexRef.current > 0) {
      goToMatch(selectedIndexRef.current - 1);
    }
  }, [goToMatch]);

  // NAVEGACIÓN INFALIBLE CON RUEDA DE RATÓN A NIVEL WINDOW
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Bloquear cualquier scroll de la página de fondo
      e.preventDefault();
      e.stopPropagation();

      if (isThrottled.current) return;

      deltaAccumulator.current += e.deltaY;

      // Umbral responsivo (20px acumulados para responder a trackpad y rueda)
      if (Math.abs(deltaAccumulator.current) >= 20) {
        if (deltaAccumulator.current > 0) {
          // Rueda hacia abajo -> Siguiente pelea (hacia la estelar)
          if (selectedIndexRef.current < matchesLengthRef.current - 1) {
            isThrottled.current = true;
            goToMatch(selectedIndexRef.current + 1);
            deltaAccumulator.current = 0;
            setTimeout(() => {
              isThrottled.current = false;
            }, 250);
          } else {
            deltaAccumulator.current = 0;
          }
        } else {
          // Rueda hacia arriba -> Pelea anterior (hacia preliminares)
          if (selectedIndexRef.current > 0) {
            isThrottled.current = true;
            goToMatch(selectedIndexRef.current - 1);
            deltaAccumulator.current = 0;
            setTimeout(() => {
              isThrottled.current = false;
            }, 250);
          } else {
            deltaAccumulator.current = 0;
          }
        }
      }
    };

    // Soporte táctil para móviles y tablets
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || isThrottled.current) return;
      const currentY = e.touches[0].clientY;
      const diffY = touchStartY.current - currentY;

      if (Math.abs(diffY) > 40) {
        if (diffY > 0 && selectedIndexRef.current < matchesLengthRef.current - 1) {
          // Swipe hacia arriba (equivale a scroll hacia abajo)
          isThrottled.current = true;
          goToMatch(selectedIndexRef.current + 1);
          touchStartY.current = currentY;
          setTimeout(() => {
            isThrottled.current = false;
          }, 280);
        } else if (diffY < 0 && selectedIndexRef.current > 0) {
          // Swipe hacia abajo (equivale a scroll hacia arriba)
          isThrottled.current = true;
          goToMatch(selectedIndexRef.current - 1);
          touchStartY.current = currentY;
          setTimeout(() => {
            isThrottled.current = false;
          }, 280);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [goToMatch]);

  // Teclado (Escape y flechas) y bloqueo de scroll de body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, [onClose, handleNext, handlePrev]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  const getSegmentBadge = () => {
    if (currentMatch?.isMainEvent) {
      return {
        label: '★ MAIN EVENT ESTELAR',
        bg: 'bg-gradient-to-r from-[#EC4D25] to-amber-500',
        text: 'text-white',
        border: 'border-[#EC4D25]',
        glow: '',
      };
    }
    if (currentMatch?.isCoMain) {
      return {
        label: 'CO-ESTELAR',
        bg: 'bg-gradient-to-r from-[#2BCFCE] to-cyan-500',
        text: 'text-[#0E1015]',
        border: 'border-[#2BCFCE]',
        glow: '',
      };
    }
    if (currentMatch?.segment === 'MAIN_CARD') {
      return {
        label: 'CARTELERA ESTELAR',
        bg: 'bg-white/20',
        text: 'text-white',
        border: 'border-white/30',
        glow: '',
      };
    }
    if (currentMatch?.segment === 'PRELIMS') {
      return {
        label: 'CARTELERA PRELIMINAR',
        bg: 'bg-[#2BCFCE]/25',
        text: 'text-[#2BCFCE]',
        border: 'border-[#2BCFCE]/50',
        glow: '',
      };
    }
    return {
      label: 'PRIMERAS PRELIMINARES',
      bg: 'bg-white/10',
      text: 'text-[#CDCDCF]',
      border: 'border-white/20',
      glow: '',
    };
  };

  const badge = getSegmentBadge();

  if (!mounted || !currentMatch) return null;

  const content = (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 w-screen h-screen flex flex-col justify-between overflow-hidden select-none text-white"
      style={{
        zIndex: 999999,
        backgroundColor: '#07090E', // 100% SÓLIDO Y OPACO
        perspective: '1400px',
      }}
    >
      {/* 1. CAPA BASE CON FONDO PERSONALIZADO fondo_parallax.jpeg */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-300 ease-out"
        style={{
          zIndex: 0,
          backgroundImage: "url('/images/fondo_parallax.jpeg')",
          transform: `scale(1.1) translate3d(${mousePos.x * 25}px, ${mousePos.y * 18}px, 0)`,
        }}
      >
        {/* Capa oscura para contrastar con los peleadores 3D */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-black/65 to-[#07090E]/85" />
        <div className="absolute inset-0 ufc-cage-mesh opacity-20" />
      </div>

      {/* 2. Focos duales con resplandor neón */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          zIndex: 2,
          transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -25}px, 0)`,
        }}
      >
        <div className="absolute -top-10 left-[8%] w-[500px] h-[500px] bg-gradient-to-br from-[#EC4D25]/20 to-red-600/5 rounded-full blur-[140px]" />
        <div className="absolute -top-10 right-[8%] w-[500px] h-[500px] bg-gradient-to-bl from-[#2BCFCE]/20 to-blue-600/5 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-48 bg-amber-500/8 rounded-full blur-[120px]" />
      </div>

      {/* 4. BARRA SUPERIOR SÓLIDA CON CONTROLES */}
      <header
        className="relative px-6 py-4 bg-[#0A0D15] border-b border-white/15 flex items-center justify-between shadow-2xl"
        style={{ zIndex: 30 }}
      >
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-[#EC4D25] text-white">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl font-black text-white font-display uppercase tracking-wider">
                CAREO 3D <span className="text-[#2BCFCE]">UFC</span>
              </span>
              <span
                className={`px-3 py-0.5 rounded-lg font-sport font-black text-xs uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-xs font-sport text-[#CDCDCF] uppercase tracking-wider flex items-center space-x-1.5">
              <span>{currentMatch?.weightClass || 'Catchweight'}</span>
              <span>•</span>
              <span className="text-[#E5A93C] font-black">{currentMatch?.roundsMax || 3} ROUNDS</span>
            </p>
          </div>
        </div>

        {/* Tip de Navegación por Scroll */}
        <div className="hidden lg:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#121622] border border-white/10 text-xs font-sport text-[#939599]">
          <Zap className="w-3.5 h-3.5 text-[#2BCFCE]" />
          <span>Rueda del ratón para avanzar entre peleas • ESC para salir</span>
        </div>

        {/* Botón Salir / Desanclar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#EC4D25] hover:bg-[#d43f19] text-white font-sport font-black text-xs uppercase tracking-wider shadow-md transition-colors active:scale-95"
            title="Desanclar y volver a la página (ESC)"
          >
            <X className="w-4 h-4" />
            <span>Salir / Desanclar</span>
          </button>
        </div>
      </header>

      {/* 5. ELEVADOR LATERAL DE VELADA (SÓLIDO) */}
      <div
        className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center space-y-2.5 bg-[#0A0D15] p-2.5 rounded-2xl border border-white/20 shadow-2xl"
        style={{ zIndex: 30 }}
      >
        <button
          onClick={handlePrev}
          disabled={selectedIndex === 0}
          className={`p-1.5 rounded-xl transition-all ${
            selectedIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white hover:bg-white/20 hover:scale-110'
          }`}
          title="Pelea anterior (hacia preliminares)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <div className="text-[11px] font-sport font-black text-[#2BCFCE] uppercase tracking-wider">
          #{selectedIndex + 1}
        </div>

        {/* Bolitas de progreso */}
        <div className="flex flex-col space-y-2 py-1">
          {displayMatches.map((m, i) => (
            <button
              key={i}
              onClick={() => goToMatch(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === i
                  ? m.isMainEvent
                    ? 'bg-[#EC4D25] scale-150 shadow-lg shadow-[#EC4D25]'
                    : 'bg-[#2BCFCE] scale-150 shadow-lg shadow-[#2BCFCE]'
                  : 'bg-white/25 hover:bg-white/50'
              }`}
              title={`Ir a pelea #${i + 1}: ${m.title}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedIndex === displayMatches.length - 1}
          className={`p-1.5 rounded-xl transition-all ${
            selectedIndex === displayMatches.length - 1
              ? 'text-white/20 cursor-not-allowed'
              : 'text-white hover:bg-white/20 hover:scale-110'
          }`}
          title="Siguiente pelea (hacia la estelar)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* 6. ESCENARIO CENTRAL DE CAREO 3D */}
      <main
        className={`relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center transition-all duration-300 ${
          isTransitioning ? 'opacity-30 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'
        }`}
        style={{ zIndex: 20 }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* ESQUINA ROJA */}
          <div
            className="lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 28}px, ${mousePos.y * 16}px, 50px) rotateY(${mousePos.x * 9}deg)`,
            }}
          >
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-t from-[#EC4D25]/25 to-transparent rounded-full blur-3xl opacity-80 group-hover:opacity-100 transition-opacity" />
              <FighterAvatar
                src={red?.avatarUrl}
                name={red?.displayName || 'Red Fighter'}
                country={red?.country || red?.affiliations?.[0]?.affiliation?.country}
                side="RED_CORNER"
                size="2xl"
                isWinner={redParticipant?.isWinner}
                className="ring-2 ring-[#EC4D25]/70 shadow-xl"
              />
            </div>

            <div className="mt-5 space-y-1">
              <span className="inline-block px-3 py-0.5 rounded bg-[#EC4D25]/25 border border-[#EC4D25]/50 text-xs font-black tracking-widest text-[#EC4D25] font-sport uppercase">
                {red?.country || 'Esquina Roja'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display uppercase tracking-wide leading-none drop-shadow-lg">
                {red?.displayName || 'Fighter'}
              </h2>
              {red?.nickname && (
                <p className="text-sm font-sport font-bold text-[#EC4D25] italic tracking-wider">
                  &ldquo;{red.nickname}&rdquo;
                </p>
              )}
              <p className="text-sm font-sport font-bold text-[#CDCDCF]">
                Récord: <span className="text-white font-black">{redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}</span>
              </p>
              {redGym && (
                <span className="inline-block text-xs font-sport font-bold text-[#939599] uppercase tracking-wider">
                  {redGym.name}
                </span>
              )}
            </div>

            {/* Red Odds Box */}
            <div className="mt-3.5 w-full max-w-[210px] p-2.5 rounded-xl bg-[#0A0D15] border border-[#EC4D25]/50">
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-[#EC4D25] font-sport">
                  {redOddAmerican}
                </span>
                <span className="text-xs font-bold text-white font-sport">
                  ({redOddDecimal}x)
                </span>
              </div>
              <div className="text-[11px] font-sport font-bold text-[#CDCDCF]">
                Probabilidad: <span className="text-[#EC4D25] font-black">{redProb}%</span>
              </div>
            </div>
          </div>

          {/* CENTRO: TALE OF THE TAPE SÓLIDO CON ESTADÍSTICAS ANIMADAS Y CLARAS */}
          <div
            className="lg:col-span-4 flex flex-col items-center bg-[#0A0D15] p-5 rounded-3xl border border-white/20 shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 25px) rotateX(${mousePos.y * -7}deg)`,
            }}
          >
            {/* Header del Tale */}
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="w-5 h-5 text-[#E5A93C]" />
              <span className="text-base sm:text-lg font-black text-white font-display uppercase tracking-wider">
                TALE OF THE TAPE • COMPARATIVA
              </span>
            </div>

            {/* BARRA COMPARATIVA DE PROBABILIDAD DE VICTORIA */}
            <div className="w-full mb-3.5 bg-[#05070B] p-3 rounded-2xl border border-white/10">
              <div className="flex justify-between text-xs font-sport font-black uppercase tracking-wider mb-1.5">
                <span className="text-[#EC4D25] flex items-center space-x-1">
                  <span>{red?.displayName?.split(' ')?.pop()}</span>
                  <span className="text-xs bg-[#EC4D25]/20 px-1.5 py-0.2 rounded border border-[#EC4D25]/40">{redProb}%</span>
                </span>
                <span className="text-[#2BCFCE] flex items-center space-x-1">
                  <span className="text-xs bg-[#2BCFCE]/20 px-1.5 py-0.2 rounded border border-[#2BCFCE]/40">{blueProb}%</span>
                  <span>{blue?.displayName?.split(' ')?.pop()}</span>
                </span>
              </div>
              <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex ring-1 ring-white/15">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-[#EC4D25] transition-all duration-700 shadow-lg shadow-[#EC4D25]/50"
                  style={{ width: `${redProb}%` }}
                />
                <div
                  className="h-full bg-gradient-to-l from-cyan-600 to-[#2BCFCE] transition-all duration-700 shadow-lg shadow-[#2BCFCE]/50"
                  style={{ width: `${blueProb}%` }}
                />
              </div>
            </div>

            {/* TABLA DE MÉTRICAS VISUALES Y COMPARATIVAS CLARAS */}
            <div className="w-full space-y-2 text-xs font-sport">
              {/* ALCANCE CON INDICADOR DE VENTAJA */}
              <div className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-black text-white text-sm">{redStats?.reach || '74 in'}</span>
                    {reachDiff > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-[#EC4D25] text-white text-[9px] font-black uppercase">
                        +{reachDiff}"
                      </span>
                    )}
                  </div>

                  <span className="text-[#939599] font-black uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <Ruler className="w-3.5 h-3.5 text-white" />
                    <span>ALCANCE (ENVERGADURA)</span>
                  </span>

                  <div className="flex items-center space-x-1.5 justify-end">
                    {reachDiff < 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-[#2BCFCE] text-[#0E1015] text-[9px] font-black uppercase">
                        +{Math.abs(reachDiff)}"
                      </span>
                    )}
                    <span className="font-black text-white text-sm">{blueStats?.reach || '74 in'}</span>
                  </div>
                </div>

                {/* Barra comparativa de alcance */}
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#EC4D25] transition-all duration-700"
                    style={{ width: `${(redReachNum / (redReachNum + blueReachNum)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-[#2BCFCE] transition-all duration-700"
                    style={{ width: `${(blueReachNum / (redReachNum + blueReachNum)) * 100}%` }}
                  />
                </div>
              </div>

              {/* ALTURA */}
              <div className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 flex items-center justify-between">
                <span className="font-black text-white text-sm w-16 text-left">{redStats?.height || '5\' 11"'}</span>
                <span className="text-[#939599] font-black uppercase tracking-wider text-[11px]">ESTATURA</span>
                <span className="font-black text-white text-sm w-16 text-right">{blueStats?.height || '6\' 0"'}</span>
              </div>

              {/* GUARDIA DE COMBATE */}
              <div className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 flex items-center justify-between">
                <span className="font-black text-[#EC4D25] text-xs w-24 text-left truncate uppercase">
                  {redStats?.stance || 'Orthodox'}
                </span>
                <span className="text-[#939599] font-black uppercase tracking-wider text-[11px]">GUARDIA</span>
                <span className="font-black text-[#2BCFCE] text-xs w-24 text-right truncate uppercase">
                  {blueStats?.stance || 'Southpaw'}
                </span>
              </div>

              {/* PRECISIÓN DE GOLPEO SIGNIFICATIVO */}
              <div className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-sm">{redAcc}%</span>
                  <span className="text-[#939599] font-black uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <Target className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <span>PRECISIÓN DE GOLPEO</span>
                  </span>
                  <span className="font-black text-white text-sm">{blueAcc}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#EC4D25] transition-all duration-700"
                    style={{ width: `${redAcc}%` }}
                  />
                  <div className="w-1 bg-black" />
                  <div
                    className="h-full bg-[#2BCFCE] transition-all duration-700"
                    style={{ width: `${blueAcc}%` }}
                  />
                </div>
              </div>

              {/* DEFENSA DE DERRIBOS */}
              <div className="p-2.5 rounded-xl bg-[#05070B] border border-white/10 flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-sm">{redTd}%</span>
                  <span className="text-[#939599] font-black uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DEFENSA DE DERRIBOS</span>
                  </span>
                  <span className="font-black text-white text-sm">{blueTd}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#EC4D25] transition-all duration-700"
                    style={{ width: `${redTd}%` }}
                  />
                  <div className="w-1 bg-black" />
                  <div
                    className="h-full bg-[#2BCFCE] transition-all duration-700"
                    style={{ width: `${blueTd}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ESQUINA AZUL */}
          <div
            className="lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * -28}px, ${mousePos.y * 16}px, 50px) rotateY(${mousePos.x * 9}deg)`,
            }}
          >
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-t from-[#2BCFCE]/25 to-transparent rounded-full blur-3xl opacity-80 group-hover:opacity-100 transition-opacity" />
              <FighterAvatar
                src={blue?.avatarUrl}
                name={blue?.displayName || 'Blue Fighter'}
                country={blue?.country || blue?.affiliations?.[0]?.affiliation?.country}
                side="BLUE_CORNER"
                size="2xl"
                isWinner={blueParticipant?.isWinner}
                className="ring-2 ring-[#2BCFCE]/70 shadow-xl"
              />
            </div>

            <div className="mt-5 space-y-1">
              <span className="inline-block px-3 py-0.5 rounded bg-[#2BCFCE]/15 border border-[#2BCFCE]/40 text-xs font-black tracking-widest text-[#2BCFCE] font-sport uppercase">
                {blue?.country || 'Esquina Azul'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display uppercase tracking-wide leading-none drop-shadow-lg">
                {blue?.displayName || 'Fighter'}
              </h2>
              {blue?.nickname && (
                <p className="text-sm font-sport font-bold text-[#2BCFCE] italic tracking-wider">
                  &ldquo;{blue.nickname}&rdquo;
                </p>
              )}
              <p className="text-sm font-sport font-bold text-[#CDCDCF]">
                Récord: <span className="text-white font-black">{blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}</span>
              </p>
              {blueGym && (
                <span className="inline-block text-xs font-sport font-bold text-[#939599] uppercase tracking-wider">
                  {blueGym.name}
                </span>
              )}
            </div>

            {/* Blue Odds Box */}
            <div className="mt-3.5 w-full max-w-[210px] p-2.5 rounded-xl bg-[#0A0D15] border border-[#2BCFCE]/50">
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-[#2BCFCE] font-sport">
                  {blueOddAmerican}
                </span>
                <span className="text-xs font-bold text-white font-sport">
                  ({blueOddDecimal}x)
                </span>
              </div>
              <div className="text-[11px] font-sport font-bold text-[#CDCDCF]">
                Probabilidad: <span className="text-[#2BCFCE] font-black">{blueProb}%</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 7. BARRA DE NAVEGACIÓN RÁPIDA INFERIOR SÓLIDA */}
      <CareoQuickNav
        matches={displayMatches}
        selectedIndex={selectedIndex}
        onSelectIndex={goToMatch}
        onClose={onClose}
      />
    </div>
  );

  return createPortal(content, document.body);
}
