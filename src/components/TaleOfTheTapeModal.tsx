'use client';

import React from 'react';
import { X, Trophy, Shield, Zap, Target, Swords } from 'lucide-react';
import { Match, MatchParticipant, FighterStats } from '../core/domain/types';

interface TaleOfTheTapeModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export function TaleOfTheTapeModal({ match, isOpen, onClose }: TaleOfTheTapeModalProps) {
  if (!isOpen) return null;

  const red = match.participants.find((p) => p.side === 'RED_CORNER');
  const blue = match.participants.find((p) => p.side === 'BLUE_CORNER');

  if (!red || !blue) return null;

  const redStats = red.participant.stats as FighterStats;
  const blueStats = blue.participant.stats as FighterStats;

  const redGym = red.participant.affiliations[0]?.affiliation;
  const blueGym = blue.participant.affiliations[0]?.affiliation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0E1015] border-2 border-[#CDCDCF] rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#282E3E] bg-black/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-[#EC4D25] text-white sports-skew">
              <Swords className="w-4 h-4 sports-unskew" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider font-display">
              TALE OF THE TAPE • COMPARATIVA OFICIAL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#939599] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fighters Face-Off Header */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Red Fighter */}
            <div className="text-center space-y-2">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-xl p-1 bg-gradient-to-b from-[#EC4D25] to-[#451408] border-2 border-[#EC4D25] overflow-hidden shadow-lg shadow-[#EC4D25]/30 sports-skew">
                <img
                  src={red.participant.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                  alt={red.participant.displayName}
                  className="w-full h-full object-cover object-top sports-unskew"
                />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#EC4D25] uppercase font-sport tracking-wider block">
                  ESQUINA ROJA
                </span>
                <p className="text-base sm:text-lg font-black text-white font-display uppercase tracking-wide leading-tight">
                  {red.participant.displayName}
                </p>
                {red.participant.nickname && (
                  <p className="text-xs text-[#EC4D25] font-sport font-bold italic">"{red.participant.nickname}"</p>
                )}
                <p className="text-xs font-sport text-[#939599]">{redGym?.name || 'Independiente'}</p>
              </div>
            </div>

            {/* VS Badge */}
            <div className="text-center">
              <div className="inline-block px-3 py-1 rounded bg-white/10 border border-white/10 text-xs font-sport font-black text-white uppercase tracking-wider">
                {match.weightClass || 'Catchweight'}
              </div>
              <p className="text-3xl font-black text-white my-1 font-display uppercase tracking-widest">VS</p>
              <div className="text-[11px] font-sport font-bold text-[#939599] uppercase tracking-wider">
                {match.roundsMax} RONDAS {match.isTitleFight ? '• CINTURÓN' : ''}
              </div>
            </div>

            {/* Blue Fighter */}
            <div className="text-center space-y-2">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-xl p-1 bg-gradient-to-b from-[#2BCFCE] to-[#0A3D3C] border-2 border-[#2BCFCE] overflow-hidden shadow-lg shadow-[#2BCFCE]/30 sports-skew">
                <img
                  src={blue.participant.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                  alt={blue.participant.displayName}
                  className="w-full h-full object-cover object-top sports-unskew"
                />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#2BCFCE] uppercase font-sport tracking-wider block">
                  ESQUINA AZUL
                </span>
                <p className="text-base sm:text-lg font-black text-white font-display uppercase tracking-wide leading-tight">
                  {blue.participant.displayName}
                </p>
                {blue.participant.nickname && (
                  <p className="text-xs text-[#2BCFCE] font-sport font-bold italic">"{blue.participant.nickname}"</p>
                )}
                <p className="text-xs font-sport text-[#939599]">{blueGym?.name || 'Independiente'}</p>
              </div>
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="space-y-2.5 pt-4 border-t border-[#282E3E]">
            <MetricRow
              label="Récord Oficial"
              redValue={`${redStats?.wins ?? 0}-${redStats?.losses ?? 0}-${redStats?.draws ?? 0}`}
              blueValue={`${blueStats?.wins ?? 0}-${blueStats?.losses ?? 0}-${blueStats?.draws ?? 0}`}
            />
            <MetricRow
              label="Altura"
              redValue={redStats?.height || 'N/A'}
              blueValue={blueStats?.height || 'N/A'}
            />
            <MetricRow
              label="Peso"
              redValue={redStats?.weight || 'N/A'}
              blueValue={blueStats?.weight || 'N/A'}
            />
            <MetricRow
              label="Alcance"
              redValue={redStats?.reach || 'N/A'}
              blueValue={blueStats?.reach || 'N/A'}
            />
            <MetricRow
              label="Guardia"
              redValue={redStats?.stance || 'Orthodox'}
              blueValue={blueStats?.stance || 'Orthodox'}
            />
            <MetricRow
              label="Gimnasio / Camp"
              redValue={redGym?.name || 'Independiente'}
              blueValue={blueGym?.name || 'Independiente'}
            />
            <MetricRow
              label="Momio Moneyline"
              redValue={red.currentOdd ? `${red.currentOdd.american} (${red.currentOdd.decimal}x)` : 'N/A'}
              blueValue={blue.currentOdd ? `${blue.currentOdd.american} (${blue.currentOdd.decimal}x)` : 'N/A'}
              highlight
            />
          </div>
        </div>
      </div>
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
      className={`grid grid-cols-3 items-center py-2.5 px-3 rounded-lg text-xs font-sport ${
        highlight ? 'bg-white/10 border border-white/20 font-black' : 'bg-black/40 border border-white/5'
      }`}
    >
      <div className="text-left font-black text-[#EC4D25] text-sm truncate">{redValue}</div>
      <div className="text-center font-bold uppercase tracking-wider text-[#CDCDCF]">
        {label}
      </div>
      <div className="text-right font-black text-[#2BCFCE] text-sm truncate">{blueValue}</div>
    </div>
  );
}

