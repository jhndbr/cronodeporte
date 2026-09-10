'use client';

import React, { useState } from 'react';
import { Match, MatchSegment } from '../core/domain/types';
import { BoutCard } from './BoutCard';
import { Swords, ArrowDownUp } from 'lucide-react';

export type FightCardSortOrder = 'MAIN_EVENT_FIRST' | 'CHRONOLOGICAL';

interface FightCardViewProps {
  matches: Match[];
}

export function FightCardView({ matches }: FightCardViewProps) {
  // Por defecto 'MAIN_EVENT_FIRST' para ver la Estelar y Co-Estelar arriba
  const [sortOrder, setSortOrder] = useState<FightCardSortOrder>('MAIN_EVENT_FIRST');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | MatchSegment>('ALL');

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

  const filteredMatches = sortedMatches.filter((m) => {
    if (selectedSegment === 'ALL') return true;
    if (selectedSegment === 'MAIN_CARD') return m.segment === 'MAIN_CARD' || m.isMainEvent || m.isCoMain;
    return m.segment === selectedSegment;
  });

  const handleOpenCareo = (matchId: string) => {
    const el = document.getElementById('careo-paralax');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="fightcard" className="space-y-4">
      {/* Header con Controles y Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#EC4D25] text-white shadow-sm shadow-[#EC4D25]/20">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
              Cartelera Completa
            </h2>
            <p className="text-xs font-sport text-slate-500 uppercase tracking-wider">
              {matches.length} Peleas Programadas • Orden Oficial UFC
            </p>
          </div>
        </div>

        {/* Controles: Orden y Filtros de Segmento */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Cambiar Orden (Estelar primero vs Cronológico) */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'MAIN_EVENT_FIRST' ? 'CHRONOLOGICAL' : 'MAIN_EVENT_FIRST'))}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-sport font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            title="Cambiar orden de combates"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-[#EC4D25]" />
            <span>{sortOrder === 'MAIN_EVENT_FIRST' ? 'Estelar Primero' : 'Cronológico'}</span>
          </button>

          {/* Filtros: Todos, Estelar, Prelims, Early */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedSegment('ALL')}
              className={`px-3 py-1.5 rounded-lg font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                selectedSegment === 'ALL'
                  ? 'bg-[#0E1015] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas ({matches.length})
            </button>

            {mainCardMatches.length > 0 && (
              <button
                onClick={() => setSelectedSegment('MAIN_CARD')}
                className={`px-3 py-1.5 rounded-lg font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedSegment === 'MAIN_CARD'
                    ? 'bg-[#EC4D25] text-white shadow-sm shadow-[#EC4D25]/20'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Estelar ({mainCardMatches.length})
              </button>
            )}

            {prelimsMatches.length > 0 && (
              <button
                onClick={() => setSelectedSegment('PRELIMS')}
                className={`px-3 py-1.5 rounded-lg font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedSegment === 'PRELIMS'
                    ? 'bg-[#0D9488] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Prelims ({prelimsMatches.length})
              </button>
            )}

            {earlyPrelimsMatches.length > 0 && (
              <button
                onClick={() => setSelectedSegment('EARLY_PRELIMS')}
                className={`px-3 py-1.5 rounded-lg font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedSegment === 'EARLY_PRELIMS'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Early ({earlyPrelimsMatches.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista Limpia de Combates */}
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
    </section>
  );
}
