'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Trophy,
  Flame,
  Swords,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Event, FighterStats } from '../core/domain/types';
import { FighterHistoryModal } from './FighterHistoryModal';
import { getCountryFlagUrl } from '@/utils/country-flags';

interface EventHeroProps {
  event: Event;
  events?: Event[];
  currentIndex?: number;
  totalEvents?: number;
  onPrevEvent?: () => void;
  onNextEvent?: () => void;
  onSelectEvent?: (eventId: string) => void;
}

function EventCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isLive: boolean;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (isNaN(target)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isLive: false };
      }

      if (diff <= 0) {
        if (diff > -6 * 3600 * 1000) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isLive: true };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isLive: false };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isPast: false, isLive: false };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#090B0E]/90 border border-white/20 shadow-md backdrop-blur-md flex items-center justify-center">
        <span className="text-[10px] sm:text-xs font-black font-sport text-white tracking-widest animate-pulse">
          --:--:--
        </span>
      </div>
    );
  }

  if (timeLeft.isLive) {
    return (
      <div className="flex flex-col items-center justify-center px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-red-600/30 border border-red-500/50 shadow-lg shadow-red-500/20 backdrop-blur-md animate-pulse">
        <span className="text-[8px] sm:text-[9px] font-sport font-black text-red-300 uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          EN VIVO
        </span>
        <span className="text-[10px] sm:text-xs font-sport font-black text-white uppercase tracking-wider">
          OCTÁGONO
        </span>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="flex flex-col items-center justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#090B0E]/90 border border-white/20 shadow-md backdrop-blur-md">
        <span className="text-[8px] font-sport font-bold text-slate-400 uppercase tracking-wider">
          EVENTO
        </span>
        <span className="text-[10px] sm:text-xs font-black font-sport text-slate-200 uppercase">
          FINALIZADO
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-[#090B0E]/90 border border-white/20 shadow-md backdrop-blur-md select-none">
      <div className="flex items-center space-x-1 text-[7px] sm:text-[8px] font-sport font-black tracking-widest text-[#E5A93C] uppercase mb-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EC4D25] animate-pulse" />
        <span>INICIA EN</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5 font-sport text-white">
        <div className="flex flex-col items-center">
          <span className="text-[11px] sm:text-xs md:text-sm font-black text-white leading-none tabular-nums">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[6px] sm:text-[7px] text-slate-400 font-bold uppercase leading-none mt-0.5">DÍAS</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-white/30 font-bold leading-none -mt-1">:</span>
        <div className="flex flex-col items-center">
          <span className="text-[11px] sm:text-xs md:text-sm font-black text-white leading-none tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[6px] sm:text-[7px] text-slate-400 font-bold uppercase leading-none mt-0.5">HRS</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-white/30 font-bold leading-none -mt-1">:</span>
        <div className="flex flex-col items-center">
          <span className="text-[11px] sm:text-xs md:text-sm font-black text-white leading-none tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[6px] sm:text-[7px] text-slate-400 font-bold uppercase leading-none mt-0.5">MIN</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-white/30 font-bold leading-none -mt-1">:</span>
        <div className="flex flex-col items-center">
          <span className="text-[11px] sm:text-xs md:text-sm font-black text-[#EC4D25] leading-none tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[6px] sm:text-[7px] text-[#EC4D25] font-bold uppercase leading-none mt-0.5">SEG</span>
        </div>
      </div>
    </div>
  );
}

export function EventHero({
  event,
  events = [],
  currentIndex = 0,
  totalEvents = 1,
  onPrevEvent,
  onNextEvent,
  onSelectEvent,
}: EventHeroProps) {
  const [selectedFighter, setSelectedFighter] = useState<{ id: string; name: string } | null>(null);
  const [redImgError, setRedImgError] = useState(false);
  const [blueImgError, setBlueImgError] = useState(false);

  // Buscar siempre el combate estelar oficial (Main Event)
  const mainBout =
    event.matches.find((m) => m.isMainEvent) ||
    event.matches[event.matches.length - 1] ||
    event.matches[0];

  const redParticipant = mainBout?.participants?.find((p) => p.side === 'RED_CORNER');
  const blueParticipant = mainBout?.participants?.find((p) => p.side === 'BLUE_CORNER');

  const red = redParticipant?.participant;
  const blue = blueParticipant?.participant;

  const redGym = red?.affiliations?.[0]?.affiliation;
  const blueGym = blue?.affiliations?.[0]?.affiliation;

  const redStats = red?.stats as FighterStats | undefined;
  const blueStats = blue?.stats as FighterStats | undefined;

  const redFlag = red ? getCountryFlagUrl(red.country || redGym?.country, red.displayName) : null;
  const blueFlag = blue ? getCountryFlagUrl(blue.country || blueGym?.country, blue.displayName) : null;

  // Fecha y hora formateada
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

  const redAvatar =
    red?.avatarUrl && !red.avatarUrl.includes('default.png') && !redImgError
      ? red.avatarUrl
      : null;

  const blueAvatar =
    blue?.avatarUrl && !blue.avatarUrl.includes('default.png') && !blueImgError
      ? blue.avatarUrl
      : null;

  return (
    <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#090B0E] border border-white/15 shadow-2xl text-white min-h-[510px] sm:min-h-[550px] md:min-h-[590px] lg:min-h-[630px] flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. FONDOS, VIÑETA CINEMATOGRÁFICA Y RESPLANDOR DE ARENA                  */}
      {/* ========================================================================= */}
      
      {/* Imagen de Arena Octágono */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-25 mix-blend-screen scale-105"
        style={{ backgroundImage: "url('/images/fondo_seccion_evento.jpeg')" }}
      />


      {/* Viñetas ambientales suaves para enmarcar la arena */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B0E] via-transparent to-[#090B0E]/50 pointer-events-none z-[4]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090B0E]/40 via-transparent to-[#090B0E]/40 pointer-events-none z-[4]" />

      {/* Iluminación suave de fondo (sin manchas duras) */}
      <div className="absolute -top-16 -left-16 w-[450px] h-[450px] bg-[#EC4D25]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-[450px] h-[450px] bg-[#2BCFCE]/12 rounded-full blur-[120px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2. PELEADORES AMPLIADOS A GRAN ESCALA (CARAS TOTALMENTE DESPEJADAS)       */}
      {/* ========================================================================= */}

      {/* PELEADOR ROJO (Izquierda - Extra grande con gran impacto visual) */}
      {redAvatar && (
        <div className="absolute bottom-0 -left-16 sm:-left-12 md:-left-10 lg:-left-8 xl:-left-6 w-[62%] sm:w-[58%] md:w-[56%] lg:w-[54%] xl:w-[52%] max-w-[950px] h-[120%] sm:h-[130%] md:h-[142%] lg:h-[155%] z-10 pointer-events-none select-none flex items-end justify-start">
          <div className="relative w-full h-full flex items-end justify-start">
            <img
              src={redAvatar}
              alt={red?.displayName || 'Peleador Esquina Roja'}
              onError={() => setRedImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain object-bottom origin-bottom-left scale-195 sm:scale-215 md:scale-235 lg:scale-260 xl:scale-280 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] opacity-80 sm:opacity-90 md:opacity-95 lg:opacity-100 transition-all duration-500"
            />
            {/* Suave difuminado inferior para fundir el corte con la base del octágono */}
            <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-[#090B0E] via-[#090B0E]/70 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* PELEADOR AZUL (Derecha - Extra grande con gran impacto visual) */}
      {blueAvatar && (
        <div className="absolute bottom-0 -right-16 sm:-right-12 md:-right-10 lg:-right-8 xl:-right-6 w-[62%] sm:w-[58%] md:w-[56%] lg:w-[54%] xl:w-[52%] max-w-[950px] h-[120%] sm:h-[130%] md:h-[142%] lg:h-[155%] z-10 pointer-events-none select-none flex items-end justify-end">
          <div className="relative w-full h-full flex items-end justify-end">
            <img
              src={blueAvatar}
              alt={blue?.displayName || 'Peleador Esquina Azul'}
              onError={() => setBlueImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain object-bottom origin-bottom-right scale-195 sm:scale-215 md:scale-235 lg:scale-260 xl:scale-280 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] opacity-80 sm:opacity-90 md:opacity-95 lg:opacity-100 transition-all duration-500"
            />
            {/* Suave difuminado inferior para fundir el corte con la base del octágono */}
            <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-[#090B0E] via-[#090B0E]/70 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FLECHAS FLOTANTES DEL CARRUSEL DE EVENTOS                              */}
      {/* ========================================================================= */}
      {totalEvents > 1 && onPrevEvent && (
        <button
          onClick={onPrevEvent}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-[#EC4D25] text-white border border-white/15 hover:border-[#EC4D25] shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-md"
          title="Evento anterior"
          aria-label="Evento anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {totalEvents > 1 && onNextEvent && (
        <button
          onClick={onNextEvent}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-[#EC4D25] text-white border border-white/15 hover:border-[#EC4D25] shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-md"
          title="Siguiente evento"
          aria-label="Siguiente evento"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* ========================================================================= */}
      {/* 4. BARRA SUPERIOR (Mismo fondo glassmórfico elegante)                      */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-4 sm:px-8 py-3 bg-black/60 backdrop-blur-md border-b border-white/15 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5" />
            <span>{event.shortName || 'UFC'}</span>
          </span>

          <span className="text-slate-300 text-xs sm:text-sm font-sport font-semibold flex items-center space-x-1.5 uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-[#2BCFCE]" />
            <span className="capitalize">{formattedDate} • {formattedTime} HS</span>
          </span>
        </div>

        {/* Indicador de evento en el carrusel */}
        {totalEvents > 1 && (
          <div className="hidden sm:flex items-center space-x-1.5 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
            <span className="text-[10px] font-sport uppercase tracking-wider text-slate-300">
              {currentIndex + 1} de {totalEvents}
            </span>
            <div className="flex items-center space-x-1">
              {events.map((ev, idx) => (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent?.(ev.id)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-4 bg-[#EC4D25]'
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  title={ev.name}
                  aria-label={`Ver ${ev.name}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-sport text-slate-300 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-[#EC4D25]" />
          <span>{event.venueName || 'T-Mobile Arena'}, {event.city || 'Las Vegas'}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CONTENIDO CENTRAL: TÍTULO, BOTONES CENTRADOS Y CUADRO ANCHO INFERIOR  */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-center max-w-5xl mx-auto flex flex-col items-center justify-between flex-1 w-full">
        
        {/* PARTE SUPERIOR: Título y Categoría */}
        <div className="space-y-1.5 pt-1 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display leading-[0.95] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            {event.name}
          </h1>

          {mainBout?.isTitleFight ? (
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-lg bg-[#E5A93C]/20 border border-[#E5A93C]/50 text-[#E5A93C] text-xs font-sport font-black uppercase tracking-widest shadow-lg">
              <Trophy className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>CINTURÓN MUNDIAL EN JUEGO • {mainBout.weightClass}</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-md bg-white/10 border border-white/15 text-slate-200 text-xs font-sport font-bold uppercase tracking-wider">
              <span>COMBATE ESTELAR • {mainBout?.weightClass || 'PESO OFICIAL'}</span>
            </div>
          )}
        </div>

        {/* PARTE MEDIA: Botón de Ver Careo centrado, y abajo el botón de Ver Cartelera también centrado */}
        <div className="flex flex-col items-center justify-center gap-2.5 my-4 sm:my-6 z-20">
          {/* 1. Botón de Ver Careo 3D (Centrado en medio de los dos peleadores) */}
          <a
            href="#careo-paralax"
            className="inline-flex items-center justify-center space-x-2 px-7 py-2.5 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#EC4D25]/35 hover:scale-105 active:scale-95 min-w-[210px]"
          >
            <Swords className="w-4 h-4" />
            <span>Ver Careo 3D</span>
          </a>

          {/* 2. Botón de Ver Cartelera (Abajo, también centrado) */}
          <a
            href="#fightcard"
            className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-sport font-bold text-xs uppercase tracking-wider border border-white/15 transition-all backdrop-blur-md hover:scale-105 active:scale-95 min-w-[210px]"
          >
            <Layers className="w-4 h-4 text-[#2BCFCE]" />
            <span>Ver Cartelera Oficial</span>
          </a>
        </div>

        {/* PARTE INFERIOR: Cuadro de nombres estilizado, más bajo en altura y ancho hacia los peleadores */}
        {mainBout && red && blue && (
          <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl bg-black/60 border border-white/15 rounded-xl sm:rounded-2xl py-2 sm:py-2.5 px-3 sm:px-6 backdrop-blur-md shadow-2xl mt-auto">
            <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
              {/* Esquina Roja (Alineado hacia la imagen del peleador izquierdo) */}
              <div className="col-span-4 sm:col-span-4 text-left pl-1 sm:pl-3 min-w-0 flex flex-col justify-center">
                <div className="flex items-center space-x-1.5 leading-tight">
                  {redFlag && (
                    <img src={redFlag} alt="" className="w-3.5 h-2.5 object-cover rounded-xs" />
                  )}
                  <span className="text-[9px] font-black tracking-widest text-[#EC4D25] font-sport uppercase">
                    ROJO
                  </span>
                </div>
                <div className="flex items-baseline space-x-1.5 truncate">
                  <h3
                    onClick={() => setSelectedFighter({ id: red.id, name: red.displayName })}
                    className="text-base sm:text-xl md:text-2xl font-black text-white font-display uppercase tracking-wide leading-tight truncate cursor-pointer hover:underline hover:text-[#EC4D25] transition-colors"
                    title={`Ver perfil de ${red.displayName}`}
                  >
                    {red.displayName}
                  </h3>
                  {red.nickname && (
                    <span className="text-[10px] sm:text-xs font-sport font-bold text-[#EC4D25] italic truncate hidden sm:inline">
                      "{red.nickname}"
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-sport text-slate-300 font-bold leading-tight">
                  {redStats ? `${redStats.wins}-${redStats.losses}-${redStats.draws}` : 'Récord Oficial'}
                </p>
              </div>

              {/* Contador del Evento Central (reemplaza al cuadrito VS) */}
              <div className="col-span-4 sm:col-span-4 flex items-center justify-center min-w-0">
                <EventCountdown targetDate={event.startDate} />
              </div>

              {/* Esquina Azul (Alineado hacia la imagen del peleador derecho) */}
              <div className="col-span-4 sm:col-span-4 text-right pr-1 sm:pr-3 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-end space-x-1.5 leading-tight">
                  <span className="text-[9px] font-black tracking-widest text-[#2BCFCE] font-sport uppercase">
                    AZUL
                  </span>
                  {blueFlag && (
                    <img src={blueFlag} alt="" className="w-3.5 h-2.5 object-cover rounded-xs" />
                  )}
                </div>
                <div className="flex items-baseline justify-end space-x-1.5 truncate">
                  {blue.nickname && (
                    <span className="text-[10px] sm:text-xs font-sport font-bold text-[#2BCFCE] italic truncate hidden sm:inline">
                      "{blue.nickname}"
                    </span>
                  )}
                  <h3
                    onClick={() => setSelectedFighter({ id: blue.id, name: blue.displayName })}
                    className="text-base sm:text-xl md:text-2xl font-black text-white font-display uppercase tracking-wide leading-tight truncate cursor-pointer hover:underline hover:text-[#2BCFCE] transition-colors"
                    title={`Ver perfil de ${blue.displayName}`}
                  >
                    {blue.displayName}
                  </h3>
                </div>
                <p className="text-[11px] font-sport text-slate-300 font-bold leading-tight">
                  {blueStats ? `${blueStats.wins}-${blueStats.losses}-${blueStats.draws}` : 'Récord Oficial'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Historial de Combates */}
      <FighterHistoryModal
        fighterId={selectedFighter?.id || null}
        fighterName={selectedFighter?.name}
        isOpen={!!selectedFighter}
        onClose={() => setSelectedFighter(null)}
      />
    </section>
  );
}
