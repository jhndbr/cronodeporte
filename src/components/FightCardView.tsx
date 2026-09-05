'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Match, MatchSegment } from '../core/domain/types';
import { BoutCard } from './BoutCard';
import { Swords, ArrowDownUp, Play, Pause, RotateCw } from 'lucide-react';
import { FightCardSortOrder } from '@/modules/events/fightcard.types';
import { CareoFullscreenController } from '@/modules/careo/CareoFullscreenController';

interface FightCardViewProps {
  matches: Match[];
}

export function FightCardView({ matches }: FightCardViewProps) {
  // Por defecto 'MAIN_EVENT_FIRST' para ver la Estelar y Co-Estelar arriba como en toda cartelera oficial
  const [sortOrder, setSortOrder] = useState<FightCardSortOrder>('MAIN_EVENT_FIRST');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | MatchSegment>('MAIN_CARD');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [careoIndex, setCareoIndex] = useState<number | null>(null);

  // Ordenar según selección
  const sortedMatches = [...matches].sort((a, b) => {
    if (sortOrder === 'MAIN_EVENT_FIRST') {
      return b.orderIndex - a.orderIndex;
    } else {
      return a.orderIndex - b.orderIndex;
    }
  });

  const mainCardMatches = sortedMatches.filter(
    (m) => m.segment === 'MAIN_CARD' || m.isMainEvent || m.isCoMain
  );
  const prelimsMatches = sortedMatches.filter((m) => m.segment === 'PRELIMS');
  const earlyPrelimsMatches = sortedMatches.filter((m) => m.segment === 'EARLY_PRELIMS');

  // Determinar los segmentos disponibles para rotación
  const availableRotationSegments: { segment: MatchSegment; duration: number; label: string }[] = [];
  if (mainCardMatches.length > 0) {
    availableRotationSegments.push({ segment: 'MAIN_CARD', duration: 10, label: 'Estelares (10s)' });
  }
  if (prelimsMatches.length > 0) {
    availableRotationSegments.push({ segment: 'PRELIMS', duration: 5, label: 'Prelims (5s)' });
  }
  if (earlyPrelimsMatches.length > 0) {
    availableRotationSegments.push({ segment: 'EARLY_PRELIMS', duration: 5, label: 'Early Prelims (5s)' });
  }

  // Temporizador de rotación de 10s (Estelar) -> 5s (Prelims) -> 5s (Early)
  useEffect(() => {
    if (!isAutoRotating || availableRotationSegments.length <= 1) {
      return;
    }

    const currentConfig = availableRotationSegments.find((s) => s.segment === selectedSegment);
    const duration = currentConfig?.duration || 10;
    setSecondsRemaining(duration);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Cambiar al siguiente segmento
          const currentIndex = availableRotationSegments.findIndex((s) => s.segment === selectedSegment);
          const nextIndex = (currentIndex + 1) % availableRotationSegments.length;
          const nextSegment = availableRotationSegments[nextIndex].segment;
          setSelectedSegment(nextSegment);
          return availableRotationSegments[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRotating, selectedSegment, availableRotationSegments.length]);

  // Selección manual de segmento
  const handleSelectSegment = (segment: 'ALL' | MatchSegment) => {
    setSelectedSegment(segment);
    // Si selecciona "Todas" o cualquier pestaña manual, se cancela la auto-rotación
    if (segment === 'ALL') {
      setIsAutoRotating(false);
    } else {
      // Si el usuario hace clic manual en un segmento específico, pausamos para que pueda leerlo
      setIsAutoRotating(false);
    }
  };

  const filteredMatches = sortedMatches.filter((m) => {
    if (selectedSegment === 'ALL') return true;
    if (selectedSegment === 'MAIN_CARD') return m.segment === 'MAIN_CARD' || m.isMainEvent || m.isCoMain;
    return m.segment === selectedSegment;
  });

  // Para el Careo 3D, siempre le pasamos la lista en orden cronológico (0 a n - 1)
  const chronologicalMatchesForCareo = [...matches].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleOpenCareo = (matchId: string) => {
    const idx = chronologicalMatchesForCareo.findIndex((m) => m.id === matchId);
    setCareoIndex(idx !== -1 ? idx : 0);
  };

  return (
    <section id="fightcard" className="space-y-4">
      {/* Header con Controles y Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CDCDCF] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#EC4D25] text-white">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                Cartelera de Combates
              </h2>
              {isAutoRotating && (
                <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EC4D25] text-[10px] font-sport font-black uppercase tracking-wider animate-pulse">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  <span>Rotando: {secondsRemaining}s</span>
                </span>
              )}
            </div>
            <p className="text-xs font-sport text-[#939599] uppercase tracking-wider">
              {matches.length} Peleas Programadas • {isAutoRotating ? 'Auto-rotación activa (10s Estelares • 5s Preliminares)' : 'Visualización fija'}
            </p>
          </div>
        </div>

        {/* Controles: Orden y Segmentos */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón de Reanudar / Pausar Rotación */}
          <button
            onClick={() => {
              if (!isAutoRotating) {
                if (selectedSegment === 'ALL') {
                  setSelectedSegment('MAIN_CARD');
                }
                setIsAutoRotating(true);
              } else {
                setIsAutoRotating(false);
              }
            }}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-sport font-bold uppercase tracking-wider transition-colors ${
              isAutoRotating
                ? 'bg-orange-50 text-[#EC4D25] border-[#EC4D25]/30 hover:bg-orange-100'
                : 'bg-white text-[#939599] border-[#CDCDCF] hover:text-[#0E1015]'
            }`}
            title={isAutoRotating ? 'Pausar rotación automática' : 'Activar rotación automática'}
          >
            {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoRotating ? 'Pausar' : 'Rotar'}</span>
          </button>

          {/* Toggle de Orden */}
          <button
            onClick={() =>
              setSortOrder((prev) =>
                prev === 'MAIN_EVENT_FIRST' ? 'CHRONOLOGICAL' : 'MAIN_EVENT_FIRST'
              )
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CDCDCF] hover:border-[#0E1015] text-[#0E1015] font-sport font-bold text-xs uppercase tracking-wider transition-colors"
            title="Cambiar orden de peleas"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-[#EC4D25]" />
            <span>
              {sortOrder === 'MAIN_EVENT_FIRST'
                ? 'Estelar Primero'
                : 'Cronológico'}
            </span>
          </button>

          {/* Segment Selector Tabs */}
          <div className="flex items-center space-x-1 bg-[#F2F3F5] p-1 rounded-lg border border-[#CDCDCF]">
            <button
              onClick={() => handleSelectSegment('ALL')}
              className={`px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                selectedSegment === 'ALL'
                  ? 'bg-[#0E1015] text-white shadow-sm'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
              title="Mostrar todas las peleas (Detiene la auto-rotación)"
            >
              Todas ({matches.length})
            </button>

            <button
              onClick={() => handleSelectSegment('MAIN_CARD')}
              className={`relative px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                selectedSegment === 'MAIN_CARD'
                  ? 'bg-[#EC4D25] text-white shadow-sm'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              <span>Estelar ({mainCardMatches.length})</span>
              {isAutoRotating && selectedSegment === 'MAIN_CARD' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/30 text-[9px]">
                  {secondsRemaining}s
                </span>
              )}
            </button>

            {prelimsMatches.length > 0 && (
              <button
                onClick={() => handleSelectSegment('PRELIMS')}
                className={`relative px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedSegment === 'PRELIMS'
                    ? 'bg-[#2BCFCE] text-[#0E1015] shadow-sm'
                    : 'text-[#939599] hover:text-[#0E1015]'
                }`}
              >
                <span>Prelims ({prelimsMatches.length})</span>
                {isAutoRotating && selectedSegment === 'PRELIMS' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/20 text-[9px]">
                    {secondsRemaining}s
                  </span>
                )}
              </button>
            )}

            {earlyPrelimsMatches.length > 0 && (
              <button
                onClick={() => handleSelectSegment('EARLY_PRELIMS')}
                className={`relative px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedSegment === 'EARLY_PRELIMS'
                    ? 'bg-[#939599] text-white shadow-sm'
                    : 'text-[#939599] hover:text-[#0E1015]'
                }`}
              >
                <span>Early ({earlyPrelimsMatches.length})</span>
                {isAutoRotating && selectedSegment === 'EARLY_PRELIMS' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/30 text-[9px]">
                    {secondsRemaining}s
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fight Cards List */}
      <div className="space-y-3">
        {filteredMatches.map((match) => (
          <BoutCard
            key={match.id}
            match={match}
            index={match.orderIndex}
            onOpenCareo={() => handleOpenCareo(match.id)}
          />
        ))}
      </div>

      {/* Pantalla Completa Careo 3D si se activa desde una tarjeta */}
      {careoIndex !== null && (
        <CareoFullscreenController
          matches={chronologicalMatchesForCareo}
          initialIndex={careoIndex}
          onClose={() => setCareoIndex(null)}
        />
      )}
    </section>
  );
}
