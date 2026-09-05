'use client';

import React, { useState } from 'react';
import { Event } from '../core/domain/types';
import { EventHero } from './EventHero';
import { UfcCareoParallax } from './UfcCareoParallax';
import { FightCardView } from './FightCardView';

interface UfcEventShowcaseProps {
  events: Event[];
  initialEventId?: string;
}

export function UfcEventShowcase({ events, initialEventId }: UfcEventShowcaseProps) {
  const [activeEventId, setActiveEventId] = useState<string>(
    initialEventId || (events.length > 0 ? events[0].id : '')
  );

  const activeIndex = events.findIndex((e) => e.id === activeEventId);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeEvent = events[safeIndex] || events[0];

  // Ordenar cronológicamente para el Careo y Cartelera
  const chronologicalMatches = activeEvent
    ? [...activeEvent.matches].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  const handlePrevEvent = () => {
    if (events.length <= 1) return;
    const prevIndex = (safeIndex - 1 + events.length) % events.length;
    setActiveEventId(events[prevIndex].id);
  };

  const handleNextEvent = () => {
    if (events.length <= 1) return;
    const nextIndex = (safeIndex + 1) % events.length;
    setActiveEventId(events[nextIndex].id);
  };

  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN DEL EVENTO PRINCIPAL COMO CARRUSEL DIRECTO (con flechas laterales flotantes) */}
      {activeEvent ? (
        <EventHero
          event={activeEvent}
          events={events}
          currentIndex={safeIndex}
          totalEvents={events.length}
          onPrevEvent={handlePrevEvent}
          onNextEvent={handleNextEvent}
          onSelectEvent={setActiveEventId}
        />
      ) : (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#CDCDCF] text-[#939599] font-sport font-bold">
          No se encontraron eventos activos en este momento.
        </div>
      )}

      {/* 2. Careo 3D con Scroll-Driven Mode, Fondo Personalizado & Pantalla Completa Anclada */}
      {chronologicalMatches.length > 0 && (
        <UfcCareoParallax matches={chronologicalMatches} />
      )}

      {/* 3. Fight Card (Cartelera Oficial con Auto-Rotación: 10s Estelares, 5s Preliminares, 5s Early) */}
      {chronologicalMatches.length > 0 && (
        <FightCardView matches={chronologicalMatches} />
      )}
    </div>
  );
}
