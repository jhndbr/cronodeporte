'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Trophy, Flame, Swords, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../core/domain/types';
import { GymBadge } from './GymBadge';
import { FighterAvatar } from './FighterAvatar';
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

  // Buscar SIEMPRE el combate estelar principal (Main Event)
  const mainBout = event.matches.find((m) => m.isMainEvent) || event.matches[event.matches.length - 1] || event.matches[0];
  const red = mainBout?.participants.find((p) => p.side === 'RED_CORNER');
  const blue = mainBout?.participants.find((p) => p.side === 'BLUE_CORNER');

  const redGym = red?.participant.affiliations[0]?.affiliation;
  const blueGym = blue?.participant.affiliations[0]?.affiliation;

  const redStats = red?.participant.stats as import('../core/domain/types').FighterStats | undefined;
  const blueStats = blue?.participant.stats as import('../core/domain/types').FighterStats | undefined;

  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#0E1015] border border-[#1E2435] shadow-2xl text-white group">
      {/* Subtle background lighting & cage mesh */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#EC4D25]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#2BCFCE]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 ufc-cage-mesh opacity-15 pointer-events-none" />

      {/* 1. Flechas Flotantes Laterales del Carrusel de Eventos */}
      {totalEvents > 1 && onPrevEvent && (
        <button
          onClick={onPrevEvent}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/80 hover:bg-[#EC4D25] text-white border-2 border-white/20 hover:border-[#EC4D25] shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group/btn backdrop-blur-md"
          title="Evento anterior"
          aria-label="Evento anterior"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover/btn:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {totalEvents > 1 && onNextEvent && (
        <button
          onClick={onNextEvent}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/80 hover:bg-[#EC4D25] text-white border-2 border-white/20 hover:border-[#EC4D25] shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group/btn backdrop-blur-md"
          title="Siguiente evento"
          aria-label="Siguiente evento"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Top Header Bar con Selector de Eventos */}
      <div className="relative z-10 px-5 sm:px-8 py-3 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider flex items-center space-x-1 shadow-sm">
            <Flame className="w-3.5 h-3.5" />
            <span>{event.shortName || 'UFC'}</span>
          </span>

          <span className="text-[#CDCDCF] text-xs sm:text-sm font-sport font-semibold flex items-center space-x-1.5 uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-[#2BCFCE]" />
            <span className="capitalize">{formattedDate} • {formattedTime} HS</span>
          </span>
        </div>

        {/* Indicador de Carrusel (Eventos) */}
        {totalEvents > 1 && (
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="text-[11px] font-sport uppercase tracking-wider text-[#939599]">
              Evento {currentIndex + 1} de {totalEvents}
            </span>
            <div className="flex items-center space-x-1.5">
              {events.map((ev, idx) => (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent?.(ev.id)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-5 bg-[#EC4D25]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  title={ev.name}
                  aria-label={`Ver ${ev.name}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-sport text-[#939599] uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-[#939599]" />
          <span>{event.venueName || 'Arena'}, {event.city || 'Las Vegas'}</span>
        </div>
      </div>

      <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-8 sm:py-10">
        {/* Event Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display leading-none">
            {event.name}
          </h1>

          {mainBout?.isTitleFight ? (
            <div className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1 rounded-md bg-[#E5A93C]/15 border border-[#E5A93C]/40 text-[#E5A93C] text-xs font-sport font-black uppercase tracking-widest shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>CINTURÓN MUNDIAL UFC • {mainBout.weightClass}</span>
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1 rounded-md bg-white/8 border border-white/15 text-[#CDCDCF] text-xs font-sport font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-[#EC4D25]" />
              <span>COMBATE ESTELAR • {mainBout?.weightClass || 'Lightweight'}</span>
            </div>
          )}
        </div>

        {/* Head-to-Head Showdown: Peleador PNG con Fondo de Bandera y Capa Oscura */}
        {mainBout && red && blue && (
          <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            {/* Esquina Roja */}
            <div className="md:col-span-5 flex items-center space-x-4 sm:space-x-5">
              <FighterAvatar
                src={red.participant.avatarUrl}
                name={red.participant.displayName}
                country={red.participant.country || redGym?.country}
                side="RED_CORNER"
                size="2xl"
                isWinner={red.isWinner}
                className="shadow-2xl ring-2 ring-[#EC4D25]/50 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-black tracking-widest text-[#EC4D25] font-sport uppercase block">
                  ESQUINA ROJA
                </span>
                <h3
                  onClick={() => setSelectedFighter({ id: red.participant.id, name: red.participant.displayName })}
                  className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-none font-display uppercase tracking-wide truncate cursor-pointer hover:underline hover:text-[#EC4D25] transition-colors"
                  title={`Ver historial completo de ${red.participant.displayName}`}
                >
                  {red.participant.displayName}
                </h3>
                {red.participant.nickname && (
                  <p className="text-xs sm:text-sm text-[#EC4D25] font-sport font-bold italic truncate">
                    &ldquo;{red.participant.nickname}&rdquo;
                  </p>
                )}
                <p className="text-sm font-sport text-[#CDCDCF] font-bold">
                  {redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}
                </p>
                <div className="pt-0.5">
                  <GymBadge affiliation={redGym} />
                </div>
              </div>
            </div>

            {/* VS Badge Central */}
            <div className="md:col-span-1 text-center flex md:flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#0E1015] border-2 border-white/20 shadow-2xl flex items-center justify-center transform rotate-45 group">
                <span className="text-lg font-black text-white font-display uppercase -rotate-45 text-transparent bg-clip-text bg-gradient-to-br from-white to-[#CDCDCF]">
                  VS
                </span>
              </div>
            </div>

            {/* Esquina Azul */}
            <div className="md:col-span-5 flex items-center justify-end space-x-4 sm:space-x-5 flex-row-reverse md:flex-row text-right md:text-left">
              <div className="space-y-1 min-w-0 md:text-right">
                <span className="text-xs font-black tracking-widest text-[#2BCFCE] font-sport uppercase block">
                  ESQUINA AZUL
                </span>
                <h3
                  onClick={() => setSelectedFighter({ id: blue.participant.id, name: blue.participant.displayName })}
                  className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-none font-display uppercase tracking-wide truncate cursor-pointer hover:underline hover:text-[#2BCFCE] transition-colors"
                  title={`Ver historial completo de ${blue.participant.displayName}`}
                >
                  {blue.participant.displayName}
                </h3>
                {blue.participant.nickname && (
                  <p className="text-xs sm:text-sm text-[#2BCFCE] font-sport font-bold italic truncate">
                    &ldquo;{blue.participant.nickname}&rdquo;
                  </p>
                )}
                <p className="text-sm font-sport text-[#CDCDCF] font-bold">
                  {blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}
                </p>
                <div className="pt-0.5 flex justify-end">
                  <GymBadge affiliation={blueGym} />
                </div>
              </div>

              <FighterAvatar
                src={blue.participant.avatarUrl}
                name={blue.participant.displayName}
                country={blue.participant.country || blueGym?.country}
                side="BLUE_CORNER"
                size="2xl"
                isWinner={blue.isWinner}
                className="shadow-2xl ring-2 ring-[#2BCFCE]/50 shrink-0"
              />
            </div>
          </div>
        )}

        {/* CTA to Careo */}
        <div className="text-center mt-6">
          <a
            href="#careo-paralax"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-black text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            <Swords className="w-4 h-4" />
            <span>Ver Careo 3D & Momios</span>
          </a>
        </div>
      </div>

      <FighterHistoryModal
        fighterId={selectedFighter?.id || null}
        fighterName={selectedFighter?.name}
        isOpen={!!selectedFighter}
        onClose={() => setSelectedFighter(null)}
      />
    </section>
  );
}
