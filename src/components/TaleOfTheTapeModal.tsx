'use client';

import React, { useState } from 'react';
import { X, Swords } from 'lucide-react';
import { Match, FighterStats } from '../core/domain/types';
import { FighterAvatar } from './FighterAvatar';
import { FighterHistoryModal } from './FighterHistoryModal';

interface TaleOfTheTapeModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export function TaleOfTheTapeModal({ match, isOpen, onClose }: TaleOfTheTapeModalProps) {
  const [selectedFighter, setSelectedFighter] = useState<{ id: string; name: string } | null>(null);

  if (!isOpen) return null;

  const red = match.participants.find((p) => p.side === 'RED_CORNER');
  const blue = match.participants.find((p) => p.side === 'BLUE_CORNER');

  if (!red || !blue) return null;

  const redStats = red.participant.stats as FighterStats | undefined;
  const blueStats = blue.participant.stats as FighterStats | undefined;

  const redGym = red.participant.affiliations[0]?.affiliation;
  const blueGym = blue.participant.affiliations[0]?.affiliation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0E1015] border border-[#282E3E] rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#282E3E] bg-black/40">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-[#EC4D25] text-white sports-skew">
              <Swords className="w-3.5 h-3.5 sports-unskew" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
              Tale of the Tape
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#939599] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Fighters Face-Off Header */}
          <div className="grid grid-cols-3 items-center gap-3">
            {/* Red Fighter */}
            <div
              onClick={() => setSelectedFighter({ id: red.participant.id, name: red.participant.displayName })}
              className="text-center space-y-1.5 flex flex-col items-center cursor-pointer group"
              title={`Ver historial completo de ${red.participant.displayName}`}
            >
              <FighterAvatar
                src={red.participant.avatarUrl}
                name={red.participant.displayName}
                country={red.participant.country || red.participant.affiliations?.[0]?.affiliation?.country}
                side="RED_CORNER"
                size="lg"
              />
              <div>
                <span className="text-[10px] font-black text-[#EC4D25] uppercase font-sport tracking-wider block">
                  ROJA
                </span>
                <p className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wide leading-tight truncate max-w-[130px] group-hover:underline group-hover:text-[#EC4D25] transition-colors">
                  {red.participant.displayName}
                </p>
                {red.participant.nickname && (
                  <p className="text-[11px] text-[#EC4D25] font-sport font-semibold italic truncate max-w-[130px]">"{red.participant.nickname}"</p>
                )}
              </div>
            </div>

            {/* VS Badge */}
            <div className="text-center">
              <div className="inline-block px-2.5 py-0.5 rounded bg-white/10 text-[11px] font-sport font-bold text-white uppercase tracking-wider">
                {match.weightClass || 'Catchweight'}
              </div>
              <p className="text-2xl font-black text-white my-0.5 font-display uppercase tracking-widest">VS</p>
              <div className="text-[10px] font-sport text-[#939599] uppercase">
                {match.roundsMax} Rondas
              </div>
            </div>

            {/* Blue Fighter */}
            <div
              onClick={() => setSelectedFighter({ id: blue.participant.id, name: blue.participant.displayName })}
              className="text-center space-y-1.5 flex flex-col items-center cursor-pointer group"
              title={`Ver historial completo de ${blue.participant.displayName}`}
            >
              <FighterAvatar
                src={blue.participant.avatarUrl}
                name={blue.participant.displayName}
                country={blue.participant.country || blue.participant.affiliations?.[0]?.affiliation?.country}
                side="BLUE_CORNER"
                size="lg"
              />
              <div>
                <span className="text-[10px] font-black text-[#2BCFCE] uppercase font-sport tracking-wider block">
                  AZUL
                </span>
                <p className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wide leading-tight truncate max-w-[130px] group-hover:underline group-hover:text-[#2BCFCE] transition-colors">
                  {blue.participant.displayName}
                </p>
                {blue.participant.nickname && (
                  <p className="text-[11px] text-[#2BCFCE] font-sport font-semibold italic truncate max-w-[130px]">"{blue.participant.nickname}"</p>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="space-y-1.5 pt-3 border-t border-[#282E3E]">
            <MetricRow
              label="Récord"
              redValue={`${redStats?.wins ?? 0}-${redStats?.losses ?? 0}-${redStats?.draws ?? 0}`}
              blueValue={`${blueStats?.wins ?? 0}-${blueStats?.losses ?? 0}-${blueStats?.draws ?? 0}`}
            />
            <MetricRow
              label="Altura"
              redValue={redStats?.height || '-'}
              blueValue={blueStats?.height || '-'}
            />
            <MetricRow
              label="Peso"
              redValue={redStats?.weight || '-'}
              blueValue={blueStats?.weight || '-'}
            />
            <MetricRow
              label="Alcance"
              redValue={redStats?.reach || '-'}
              blueValue={blueStats?.reach || '-'}
            />
            <MetricRow
              label="Guardia"
              redValue={redStats?.stance || 'Orthodox'}
              blueValue={blueStats?.stance || 'Orthodox'}
            />
            <MetricRow
              label="Gimnasio"
              redValue={redGym?.name || 'Independiente'}
              blueValue={blueGym?.name || 'Independiente'}
            />
            <MetricRow
              label="Momio"
              redValue={red.currentOdd ? `${red.currentOdd.american} (${red.currentOdd.decimal}x)` : '-'}
              blueValue={blue.currentOdd ? `${blue.currentOdd.american} (${blue.currentOdd.decimal}x)` : '-'}
              highlight
            />
          </div>
        </div>
      </div>

      <FighterHistoryModal
        fighterId={selectedFighter?.id || null}
        fighterName={selectedFighter?.name}
        isOpen={!!selectedFighter}
        onClose={() => setSelectedFighter(null)}
      />
    </div>
  );
}

function MetricRow({
  label,
  redValue,
  blueValue,
  highlight = false,
}: {
  label: string;
  redValue: string;
  blueValue: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-3 items-center py-2 px-3 rounded-lg text-xs font-sport ${
        highlight ? 'bg-white/10 border border-white/10 font-bold' : 'bg-black/30'
      }`}
    >
      <div className="text-left font-bold text-[#EC4D25] text-xs truncate">{redValue}</div>
      <div className="text-center font-semibold uppercase tracking-wider text-[#939599] text-[11px]">
        {label}
      </div>
      <div className="text-right font-bold text-[#2BCFCE] text-xs truncate">{blueValue}</div>
    </div>
  );
}
