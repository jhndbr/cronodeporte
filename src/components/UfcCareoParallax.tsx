'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Swords, Trophy, ChevronLeft, ChevronRight, Maximize2, Zap, Target, Shield, Ruler } from 'lucide-react';
import { Match } from '../core/domain/types';
import { FighterAvatar } from './FighterAvatar';
import { CareoFullscreenController } from '@/modules/careo/CareoFullscreenController';
import { getCountryFlagUrl } from '@/utils/country-flags';

interface UfcCareoParallaxProps {
  matches: Match[];
  initialMatchIndex?: number;
}

export function UfcCareoParallax({ matches, initialMatchIndex = 0 }: UfcCareoParallaxProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialMatchIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUserExited, setHasUserExited] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(true);

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

  const redFlag = red ? getCountryFlagUrl(red.country || redGym?.country, red.displayName) : null;
  const blueFlag = blue ? getCountryFlagUrl(blue.country || blueGym?.country, blue.displayName) : null;

  // Reiniciar a la primera pelea si cambia la lista de combates por cambio de evento
  useEffect(() => {
    setSelectedIndex(0);
  }, [matches]);

  // Odds calculation & Implied Probability
  const redOddAmerican = redParticipant?.currentOdd?.american || '-135';
  const blueOddAmerican = blueParticipant?.currentOdd?.american || '+115';
  const redOddDecimal = redParticipant?.currentOdd?.decimal || 1.74;
  const blueOddDecimal = blueParticipant?.currentOdd?.decimal || 2.15;

  const redProb = Math.round(
    redOddDecimal > 0 ? (1 / redOddDecimal) * 100 : 55
  );
  const blueProb = Math.max(10, Math.min(90, 100 - redProb));

  // Rastreo de dirección de scroll: SOLO permitir auto-fullscreen cuando se baja hacia el careo
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      isScrollingDown.current = currentY > lastScrollY.current;
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // AUTO-TRIGGER A PANTALLA COMPLETA: SOLO AL BAJAR HACIA EL CAREO
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Solo activamos si:
          // 1. La caja ocupa la mayor parte de la pantalla (75%+)
          // 2. El usuario está bajando (isScrollingDown.current === true)
          // 3. No ha salido manualmente en esta misma visita
          // -> SI SUBE DESDE ABAJO HACIA ARRIBA, NUNCA SE ACTIVA
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            if (!hasUserExited && !isFullscreen && isScrollingDown.current) {
              setIsFullscreen(true);
            }
          } else if (entry.intersectionRatio < 0.15) {
            // Si el usuario se alejó completamente de la sección, reseteamos el flag de salida manual
            setHasUserExited(false);
          }
        });
      },
      {
        threshold: [0.15, 0.5, 0.75, 0.9],
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasUserExited, isFullscreen]);

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setHasUserExited(true); // Evita que se vuelva a abrir inmediatamente
  };

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
    setHasUserExited(false);
  };

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
    <>
      <section id="careo-paralax" className="space-y-4 pt-2">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CDCDCF] pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#2BCFCE] text-[#0E1015] shadow-sm sports-skew">
              <Swords className="w-5 h-5 sports-unskew" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                  Careo 3D & Estadísticas
                </h2>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-[10px] font-sport font-black uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-[#2BCFCE]" />
                  <span>Auto-anclaje al bajar</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Botón Pantalla Completa Anclada */}
            <button
              onClick={handleOpenFullscreen}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0E1015] to-[#1E2330] hover:from-[#EC4D25] hover:to-orange-600 text-white font-sport font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105"
            >
              <Maximize2 className="w-4 h-4 text-[#2BCFCE]" />
              <span>Pantalla Completa Anclada</span>
            </button>

            {/* Match Switcher Tabs */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handlePrevMatch}
                className="p-1.5 rounded-lg bg-white border border-[#CDCDCF] text-[#0E1015] hover:bg-[#EC4D25] hover:text-white transition-all shadow-sm"
                aria-label="Pelea anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center space-x-1 overflow-x-auto max-w-xs md:max-w-md p-1 bg-[#EAECEF] rounded-xl border border-[#CDCDCF]">
                {displayMatches.map((m, idx) => (
                  <button
                    key={m.id || idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg font-sport font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
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
                className="p-1.5 rounded-lg bg-white border border-[#CDCDCF] text-[#0E1015] hover:bg-[#EC4D25] hover:text-white transition-all shadow-sm"
                aria-label="Siguiente pelea"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Parallax Staredown Stage con fondo 100% sólido y fondo_parallax.jpeg */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden rounded-3xl bg-[#0A0C10] border-2 border-[#282E3E] shadow-2xl min-h-[600px] flex flex-col justify-between select-none"
        >
          {/* Fondo Personalizado Parallax con fondo_parallax.jpeg */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out pointer-events-none"
            style={{
              backgroundImage: "url('/images/fondo_parallax.jpeg')",
              transform: `scale(1.08) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
            }}
          >
            {/* Capa oscura superpuesta para que resalten los peleadores y los datos */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-black/60 to-[#0A0C10]/80 backdrop-brightness-75" />
            <div className="absolute inset-0 ufc-cage-mesh opacity-20" />
          </div>

          {/* Focos Neón */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-500 ease-out"
            style={{
              transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
            }}
          >
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#EC4D25]/30 rounded-full blur-[100px]" />
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#2BCFCE]/30 rounded-full blur-[100px]" />
          </div>

          {/* Header Info */}
          <div className="relative z-20 px-6 py-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider">
                {currentMatch?.isMainEvent ? '★ MAIN EVENT' : currentMatch?.isCoMain ? 'CO-ESTELAR' : 'CARTELERA'}
              </span>
              <span className="text-white font-sport font-bold text-sm tracking-wider uppercase">
                {currentMatch?.weightClass || 'Catchweight'} • {currentMatch?.roundsMax || 3} ROUNDS
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-sport text-[#CDCDCF] uppercase tracking-wider hidden sm:inline">
                Pelea {selectedIndex + 1} de {displayMatches.length}
              </span>
              <button
                onClick={handleOpenFullscreen}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-[#EC4D25] text-white transition-colors"
                title="Abrir en Pantalla Completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CAREO SHOWDOWN */}
          <div className="relative z-20 px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
            {/* RED FIGHTER */}
            <div
              className="relative lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out p-4 rounded-2xl overflow-hidden"
              style={{
                transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 15}px)`,
              }}
            >
              {/* Flag Watermark */}
              {redFlag && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${redFlag})`,
                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)',
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="absolute -inset-3 bg-[#EC4D25]/30 rounded-full blur-xl animate-pulse" />
                <FighterAvatar
                  src={red?.avatarUrl}
                  name={red?.displayName || 'Red Fighter'}
                  country={red?.country || redGym?.country}
                  side="RED_CORNER"
                  size="2xl"
                  isWinner={redParticipant?.isWinner}
                  className="ring-4 ring-[#EC4D25] shadow-2xl"
                />
              </div>

              <div className="mt-4 space-y-0.5">
                <span className="text-xs font-black tracking-widest text-[#EC4D25] font-sport uppercase">
                  {red?.country || 'Esquina Roja'}
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-wide leading-none">
                  {red?.displayName || 'Fighter'}
                </h3>
                {red?.nickname && (
                  <p className="text-xs font-sport font-bold text-[#EC4D25] italic tracking-wider">
                    "{red.nickname}"
                  </p>
                )}
                <p className="text-xs font-sport font-bold text-[#CDCDCF]">
                  {redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}
                </p>
                {redGym && (
                  <span className="inline-block text-[11px] font-sport font-bold text-[#939599] uppercase tracking-wider mt-0.5">
                    {redGym.name}
                  </span>
                )}
              </div>

              {/* Red Odds Box */}
              <div className="mt-3 w-full max-w-[200px] p-2.5 rounded-xl bg-black/70 border border-[#EC4D25]/80 shadow-lg">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-2xl font-black text-[#EC4D25] font-sport">
                    {redOddAmerican}
                  </span>
                  <span className="text-xs font-bold text-white font-sport">
                    ({redOddDecimal}x)
                  </span>
                </div>
                <div className="text-[10px] font-sport font-bold text-[#CDCDCF]">
                  Probabilidad: <span className="text-[#EC4D25] font-black">{redProb}%</span>
                </div>
              </div>
            </div>

            {/* CENTER: TALE OF THE TAPE */}
            <div
              className="lg:col-span-4 flex flex-col items-center bg-[#151821]/95 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
              }}
            >
              <div className="flex items-center space-x-1.5 mb-3">
                <Trophy className="w-4 h-4 text-[#E5A93C]" />
                <span className="text-base font-black text-white font-display uppercase tracking-wider">
                  TALE OF THE TAPE
                </span>
              </div>

              {/* Win Probability Bar */}
              <div className="w-full mb-4 bg-black/60 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px] font-sport font-black uppercase tracking-wider mb-1">
                  <span className="text-[#EC4D25]">{red?.displayName?.split(' ').pop()} {redProb}%</span>
                  <span className="text-[#2BCFCE]">{blueProb}% {blue?.displayName?.split(' ').pop()}</span>
                </div>
                <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#EC4D25] transition-all duration-500 shadow-md shadow-[#EC4D25]/50"
                    style={{ width: `${redProb}%` }}
                  />
                  <div
                    className="h-full bg-[#2BCFCE] transition-all duration-500 shadow-md shadow-[#2BCFCE]/50"
                    style={{ width: `${blueProb}%` }}
                  />
                </div>
              </div>

              {/* Key Comparison Metrics */}
              <div className="w-full space-y-1.5 text-xs font-sport">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="font-black text-white text-sm w-16 text-left">{redStats?.height || '5\' 11"'}</span>
                  <span className="text-[#939599] font-bold uppercase tracking-wider text-[11px]">ALTURA</span>
                  <span className="font-black text-white text-sm w-16 text-right">{blueStats?.height || '6\' 0"'}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="font-black text-white text-sm w-16 text-left">{redStats?.reach || '75 in'}</span>
                  <span className="text-[#939599] font-bold uppercase tracking-wider text-[11px]">ALCANCE</span>
                  <span className="font-black text-white text-sm w-16 text-right">{blueStats?.reach || '74 in'}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="font-black text-[#EC4D25] text-xs w-20 text-left truncate">{redStats?.stance || 'Orthodox'}</span>
                  <span className="text-[#939599] font-bold uppercase tracking-wider text-[11px]">GUARDIA</span>
                  <span className="font-black text-[#2BCFCE] text-xs w-20 text-right truncate">{blueStats?.stance || 'Southpaw'}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="font-black text-white text-sm w-16 text-left">{redStats?.strikingAccuracy ? `${redStats.strikingAccuracy}%` : '58%'}</span>
                  <span className="text-[#939599] font-bold uppercase tracking-wider text-[11px]">GOLPEO</span>
                  <span className="font-black text-white text-sm w-16 text-right">{blueStats?.strikingAccuracy ? `${blueStats.strikingAccuracy}%` : '52%'}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="font-black text-white text-sm w-16 text-left">{redStats?.takedownDefense ? `${redStats.takedownDefense}%` : '75%'}</span>
                  <span className="text-[#939599] font-bold uppercase tracking-wider text-[11px]">DEF. DERRIBO</span>
                  <span className="font-black text-white text-sm w-16 text-right">{blueStats?.takedownDefense ? `${blueStats.takedownDefense}%` : '80%'}</span>
                </div>
              </div>
            </div>

            {/* BLUE FIGHTER */}
            <div
              className="relative lg:col-span-4 flex flex-col items-center text-center transition-transform duration-300 ease-out p-4 rounded-2xl overflow-hidden"
              style={{
                transform: `translate(${mousePos.x * -25}px, ${mousePos.y * 15}px)`,
              }}
            >
              {/* Flag Watermark */}
              {blueFlag && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${blueFlag})`,
                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)',
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="absolute -inset-3 bg-[#2BCFCE]/30 rounded-full blur-xl animate-pulse" />
                <FighterAvatar
                  src={blue?.avatarUrl}
                  name={blue?.displayName || 'Blue Fighter'}
                  country={blue?.country || blueGym?.country}
                  side="BLUE_CORNER"
                  size="2xl"
                  isWinner={blueParticipant?.isWinner}
                  className="ring-4 ring-[#2BCFCE] shadow-2xl"
                />
              </div>

              <div className="mt-4 space-y-0.5">
                <span className="text-xs font-black tracking-widest text-[#2BCFCE] font-sport uppercase">
                  {blue?.country || 'Esquina Azul'}
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-wide leading-none">
                  {blue?.displayName || 'Fighter'}
                </h3>
                {blue?.nickname && (
                  <p className="text-xs font-sport font-bold text-[#2BCFCE] italic tracking-wider">
                    "{blue.nickname}"
                  </p>
                )}
                <p className="text-xs font-sport font-bold text-[#CDCDCF]">
                  {blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}
                </p>
                {blueGym && (
                  <span className="inline-block text-[11px] font-sport font-bold text-[#939599] uppercase tracking-wider mt-0.5">
                    {blueGym.name}
                  </span>
                )}
              </div>

              {/* Blue Odds Box */}
              <div className="mt-3 w-full max-w-[200px] p-2.5 rounded-xl bg-black/70 border border-[#2BCFCE]/80 shadow-lg">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-2xl font-black text-[#2BCFCE] font-sport">
                    {blueOddAmerican}
                  </span>
                  <span className="text-xs font-bold text-white font-sport">
                    ({blueOddDecimal}x)
                  </span>
                </div>
                <div className="text-[10px] font-sport font-bold text-[#CDCDCF]">
                  Probabilidad: <span className="text-[#2BCFCE] font-black">{blueProb}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-20 px-6 py-2.5 bg-black/80 border-t border-white/10 flex items-center justify-between text-xs font-sport">
            <span className="text-[#CDCDCF]">
              Pelea: <b className="text-white">{currentMatch?.title}</b>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#EC4D25] text-[#2BCFCE] hover:text-white font-sport font-black uppercase tracking-wider transition-all flex items-center space-x-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Pantalla Completa Anclada</span>
              </button>

              <button
                onClick={handleNextMatch}
                className="px-3.5 py-1.5 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-bold uppercase tracking-wider transition-colors"
              >
                Siguiente Pelea &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCIA PANTALLA COMPLETA ANCLADA */}
      {isFullscreen && (
        <CareoFullscreenController
          matches={displayMatches}
          initialIndex={selectedIndex}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  );
}
