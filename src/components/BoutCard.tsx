'use client';

import React, { useState } from 'react';
import { Trophy, BarChart2, ShieldCheck, Flame, Maximize2, Check, Sparkles } from 'lucide-react';
import { Match } from '../core/domain/types';
import { GymBadge } from './GymBadge';
import { TaleOfTheTapeModal } from './TaleOfTheTapeModal';
import { FighterHistoryModal } from './FighterHistoryModal';
import { FighterAvatar } from './FighterAvatar';
import { getCountryFlagUrl } from '@/utils/country-flags';

interface BoutCardProps {
  match: Match;
  index: number;
  onOpenCareo?: () => void;
  selectedWinnerSide?: 'RED_CORNER' | 'BLUE_CORNER' | null;
  onSelectWinner?: (side: 'RED_CORNER' | 'BLUE_CORNER') => void;
}

export function BoutCard({
  match,
  index,
  onOpenCareo,
  selectedWinnerSide,
  onSelectWinner,
}: BoutCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<{ id: string; name: string } | null>(null);

  const red = match.participants.find((p) => p.side === 'RED_CORNER');
  const blue = match.participants.find((p) => p.side === 'BLUE_CORNER');

  if (!red || !blue) return null;

  const redStats = red.participant.stats as import('../core/domain/types').FighterStats | undefined;
  const blueStats = blue.participant.stats as import('../core/domain/types').FighterStats | undefined;

  const redGym = red.participant.affiliations[0]?.affiliation;
  const blueGym = blue.participant.affiliations[0]?.affiliation;

  const redFlag = getCountryFlagUrl(red.participant.country || redGym?.country, red.participant.displayName);
  const blueFlag = getCountryFlagUrl(blue.participant.country || blueGym?.country, blue.participant.displayName);

  const isLive = match.status === 'IN_PROGRESS';
  const isFinished = match.status === 'FINISHED';

  return (
    <>
      <div
        className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
          match.isMainEvent
            ? 'bg-[#12151D] text-white border-[#EC4D25]/40 shadow-lg'
            : match.isCoMain
            ? 'bg-[#12151D] text-white border-[#2BCFCE]/30 shadow-md'
            : 'bg-white text-[#1A1E24] border-[#CDCDCF] hover:border-[#939599]'
        }`}
      >
        {/* Card Header */}
        <div
          className={`flex items-center justify-between px-4 py-2 text-xs font-sport uppercase tracking-wider border-b ${
            match.isMainEvent || match.isCoMain
              ? 'bg-black/30 border-white/8 text-[#CDCDCF]'
              : 'bg-[#FAFAFA] border-[#EAECEF] text-[#939599]'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-black text-[#EC4D25]">#{index + 1}</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                match.isMainEvent || match.isCoMain ? 'bg-white/10 text-white' : 'bg-[#EAECEF] text-[#0E1015]'
              }`}
            >
              {match.weightClass || 'Catchweight'}
            </span>
            {match.isTitleFight && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#E5A93C] text-black font-black text-[11px]">
                <Trophy className="w-3 h-3" />
                <span>TÍTULO UFC</span>
              </span>
            )}
            {match.isMainEvent && !match.isTitleFight && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#EC4D25] text-white font-black text-[11px]">
                <Flame className="w-3 h-3" />
                <span>ESTELAR</span>
              </span>
            )}
            {match.isCoMain && (
              <span className="px-2 py-0.5 rounded bg-[#2BCFCE] text-black font-black text-[11px]">
                CO-ESTELAR
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isLive && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#EC4D25] text-white font-black text-[10px] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>EN VIVO</span>
              </span>
            )}
            {isFinished && (
              <span className="px-2 py-0.5 rounded bg-black/10 text-[#939599] font-bold text-[11px]">
                FINALIZADO {match.victoryMethod ? `(${match.victoryMethod.replace('_', '/')})` : ''}
              </span>
            )}

            {/* Ver en Careo 3D Button */}
            {onOpenCareo && (
              <button
                onClick={onOpenCareo}
                className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#EC4D25]/15 hover:bg-[#EC4D25] text-[#EC4D25] hover:text-white border border-[#EC4D25]/30 text-[10px] font-bold tracking-wider transition-all duration-150"
                title="Ver cara a cara 3D interactivo"
              >
                <Maximize2 className="w-3 h-3" />
                <span>CAREO 3D</span>
              </button>
            )}

            {/* Tale of the Tape Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#0E1015] dark:text-white border border-[#CDCDCF] dark:border-white/15 text-[10px] font-bold tracking-wider transition-all duration-150"
              title="Comparativa Tale of the Tape"
            >
              <BarChart2 className="w-3 h-3" />
              <span>STATS</span>
            </button>
          </div>
        </div>

        {/* Card Body - Grid with Participants & Prediction Buttons */}
        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">
          {/* Red Corner Fighter */}
          <div className="md:col-span-5 flex items-center space-x-3 sm:space-x-3.5">
            <FighterAvatar
              src={red.participant.avatarUrl}
              name={red.participant.displayName}
              country={red.participant.country || redGym?.country}
              side="RED_CORNER"
              size="md"
              isWinner={red.isWinner}
            />

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black tracking-wider text-[#EC4D25] uppercase font-sport block">
                ROJO
              </span>
              <div className="flex items-center space-x-1.5">
                <h4
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFighter({ id: red.participant.id, name: red.participant.displayName });
                  }}
                  className={`text-base sm:text-lg font-black truncate font-display uppercase tracking-wide leading-none cursor-pointer hover:underline hover:text-[#EC4D25] transition-colors ${
                    match.isMainEvent || match.isCoMain ? 'text-white' : 'text-[#0E1015]'
                  }`}
                  title={`Ver ficha e historial de ${red.participant.displayName}`}
                >
                  {red.participant.displayName}
                </h4>
                {red.isWinner && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>

              {red.participant.nickname && (
                <p className="text-xs text-[#EC4D25] font-sport font-semibold truncate italic">
                  &ldquo;{red.participant.nickname}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span
                  className={`text-xs font-sport font-bold ${
                    match.isMainEvent || match.isCoMain ? 'text-[#CDCDCF]' : 'text-[#939599]'
                  }`}
                >
                  {redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}
                </span>
                <GymBadge affiliation={redGym} />
              </div>
            </div>

            {/* Red Prediction Choice Button */}
            {onSelectWinner && (
              <button
                onClick={() => onSelectWinner('RED_CORNER')}
                className={`px-3 py-2 rounded-xl font-sport font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shrink-0 ${
                  selectedWinnerSide === 'RED_CORNER'
                    ? 'bg-[#EC4D25] text-white shadow-md shadow-[#EC4D25]/40 scale-105'
                    : 'bg-black/5 dark:bg-white/10 text-slate-400 hover:text-white hover:bg-[#EC4D25]/20 border border-black/10 dark:border-white/10'
                }`}
                title={`Predecir victoria de ${red.participant.displayName}`}
              >
                {selectedWinnerSide === 'RED_CORNER' && <Check className="w-3.5 h-3.5" />}
                <span>GANA</span>
              </button>
            )}
          </div>

          {/* Center VS Indicator */}
          <div className="md:col-span-1 text-center flex md:flex-col items-center justify-center py-0.5">
            <div className="w-7 h-7 rounded-md bg-[#EAECEF] border border-[#CDCDCF] flex items-center justify-center">
              <span className="text-[11px] font-black text-[#0E1015] font-sport uppercase">
                VS
              </span>
            </div>
          </div>

          {/* Blue Corner Fighter */}
          <div className="md:col-span-5 flex items-center justify-end space-x-3 sm:space-x-3.5 flex-row-reverse md:flex-row text-right md:text-left">
            {/* Blue Prediction Choice Button */}
            {onSelectWinner && (
              <button
                onClick={() => onSelectWinner('BLUE_CORNER')}
                className={`px-3 py-2 rounded-xl font-sport font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shrink-0 ${
                  selectedWinnerSide === 'BLUE_CORNER'
                    ? 'bg-[#2BCFCE] text-black shadow-md shadow-[#2BCFCE]/40 scale-105 font-black'
                    : 'bg-black/5 dark:bg-white/10 text-slate-400 hover:text-white hover:bg-[#2BCFCE]/20 border border-black/10 dark:border-white/10'
                }`}
                title={`Predecir victoria de ${blue.participant.displayName}`}
              >
                {selectedWinnerSide === 'BLUE_CORNER' && <Check className="w-3.5 h-3.5 text-black" />}
                <span>GANA</span>
              </button>
            )}

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black tracking-wider text-[#0A8E8D] uppercase font-sport block md:text-right">
                AZUL
              </span>
              <div className="flex items-center justify-end space-x-1.5">
                {blue.isWinner && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                <h4
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFighter({ id: blue.participant.id, name: blue.participant.displayName });
                  }}
                  className={`text-base sm:text-lg font-black truncate font-display uppercase tracking-wide leading-none md:text-right cursor-pointer hover:underline hover:text-[#0A8E8D] transition-colors ${
                    match.isMainEvent || match.isCoMain ? 'text-white' : 'text-[#0E1015]'
                  }`}
                  title={`Ver ficha e historial de ${blue.participant.displayName}`}
                >
                  {blue.participant.displayName}
                </h4>
              </div>

              {blue.participant.nickname && (
                <p className="text-xs text-[#0A8E8D] font-sport font-semibold truncate italic md:text-right">
                  &ldquo;{blue.participant.nickname}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-1.5 mt-1">
                <span
                  className={`text-xs font-sport font-bold ${
                    match.isMainEvent || match.isCoMain ? 'text-[#CDCDCF]' : 'text-[#939599]'
                  }`}
                >
                  {blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}
                </span>
                <GymBadge affiliation={blueGym} />
              </div>
            </div>

            <FighterAvatar
              src={blue.participant.avatarUrl}
              name={blue.participant.displayName}
              country={blue.participant.country || blueGym?.country}
              side="BLUE_CORNER"
              size="md"
              isWinner={blue.isWinner}
            />
          </div>
        </div>
      </div>

      <TaleOfTheTapeModal
        match={match}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <FighterHistoryModal
        fighterId={selectedFighter?.id || null}
        fighterName={selectedFighter?.name}
        isOpen={!!selectedFighter}
        onClose={() => setSelectedFighter(null)}
      />
    </>
  );
}
