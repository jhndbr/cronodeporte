'use client';

import React, { useState } from 'react';
import { Match, MatchSegment } from '../core/domain/types';
import { BoutCard } from './BoutCard';
import { Layers, Flame, Swords } from 'lucide-react';

interface FightCardViewProps {
  matches: Match[];
}

export function FightCardView({ matches }: FightCardViewProps) {
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | MatchSegment>('ALL');

  const mainCardMatches = matches.filter((m) => m.segment === 'MAIN_CARD' || m.isMainEvent || m.isCoMain);
  const prelimsMatches = matches.filter((m) => m.segment === 'PRELIMS');
  const earlyPrelimsMatches = matches.filter((m) => m.segment === 'EARLY_PRELIMS');

  const filteredMatches = matches.filter((m) => {
    if (selectedSegment === 'ALL') return true;
    if (selectedSegment === 'MAIN_CARD') return m.segment === 'MAIN_CARD' || m.isMainEvent || m.isCoMain;
    return m.segment === selectedSegment;
  });

  return (
    <section id="fightcard" className="space-y-6">
      {/* Segment Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#CDCDCF] pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-[#EC4D25] text-white shadow-sm sports-skew">
            <Swords className="w-5 h-5 sports-unskew" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
              CARTELERA OFICIAL UFC
            </h2>
            <span className="text-xs font-sport font-bold text-[#939599] uppercase tracking-wider block -mt-1">
              {matches.length} COMBATES CONFIRMADOS • ORDEN DE PELEAS Y MOMIOS
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#EAECEF] p-1.5 rounded-lg border border-[#CDCDCF]">
          <button
            onClick={() => setSelectedSegment('ALL')}
            className={`px-3.5 py-1.5 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
              selectedSegment === 'ALL'
                ? 'bg-[#0E1015] text-white shadow-sm'
                : 'text-[#939599] hover:text-[#0E1015]'
            }`}
          >
            TODOS ({matches.length})
          </button>

          <button
            onClick={() => setSelectedSegment('MAIN_CARD')}
            className={`px-3.5 py-1.5 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
              selectedSegment === 'MAIN_CARD'
                ? 'bg-[#EC4D25] text-white shadow-md shadow-[#EC4D25]/30'
                : 'text-[#939599] hover:text-[#0E1015]'
            }`}
          >
            ESTELAR ({mainCardMatches.length})
          </button>

          {prelimsMatches.length > 0 && (
            <button
              onClick={() => setSelectedSegment('PRELIMS')}
              className={`px-3.5 py-1.5 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                selectedSegment === 'PRELIMS'
                  ? 'bg-[#2BCFCE] text-[#0E1015] shadow-md shadow-[#2BCFCE]/30'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              PRELIMS ({prelimsMatches.length})
            </button>
          )}

          {earlyPrelimsMatches.length > 0 && (
            <button
              onClick={() => setSelectedSegment('EARLY_PRELIMS')}
              className={`px-3.5 py-1.5 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                selectedSegment === 'EARLY_PRELIMS'
                  ? 'bg-[#939599] text-white'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              EARLY ({earlyPrelimsMatches.length})
            </button>
          )}
        </div>
      </div>

      {/* Fight Cards Grid */}
      <div className="space-y-4">
        {filteredMatches.map((match, idx) => (
          <BoutCard key={match.id} match={match} index={idx} />
        ))}
      </div>
    </section>
  );
}

