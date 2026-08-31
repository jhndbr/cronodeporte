'use client';

import React, { useState } from 'react';
import { Trophy, ChevronRight, BarChart2, ShieldCheck, Flame, Swords } from 'lucide-react';
import { Match, MatchParticipant } from '../core/domain/types';
import { GymBadge } from './GymBadge';
import { TaleOfTheTapeModal } from './TaleOfTheTapeModal';

interface BoutCardProps {
  match: Match;
  index: number;
}

export function BoutCard({ match, index }: BoutCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const red = match.participants.find((p) => p.side === 'RED_CORNER');
  const blue = match.participants.find((p) => p.side === 'BLUE_CORNER');

  if (!red || !blue) return null;

  const redStats = red.participant.stats as import('../core/domain/types').FighterStats | undefined;
  const blueStats = blue.participant.stats as import('../core/domain/types').FighterStats | undefined;

  const redGym = red.participant.affiliations[0]?.affiliation;
  const blueGym = blue.participant.affiliations[0]?.affiliation;

  const isLive = match.status === 'IN_PROGRESS';
  const isFinished = match.status === 'FINISHED';

  return (
    <>
      <div
        className={`relative rounded-xl border-2 transition-all duration-200 overflow-hidden shadow-sm ${
          match.isMainEvent
            ? 'bg-gradient-to-r from-[#151821] via-[#0E1015] to-[#151821] text-white border-[#EC4D25] shadow-lg shadow-[#EC4D25]/10'
            : match.isCoMain
            ? 'bg-[#151821] text-white border-[#2BCFCE]/80'
            : 'bg-white text-[#1A1E24] border-[#CDCDCF] hover:border-[#939599]'
        }`}
      >
        {/* Card Header with Badges */}
        <div
          className={`flex items-center justify-between px-4 py-2 text-xs font-sport tracking-wider uppercase border-b ${
            match.isMainEvent || match.isCoMain
              ? 'bg-black/50 border-white/10 text-[#CDCDCF]'
              : 'bg-[#FAFAFA] border-[#CDCDCF] text-[#939599]'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-black text-[#EC4D25]">#{index + 1}</span>
            <span
              className={`px-2 py-0.5 rounded font-black text-[11px] ${
                match.isMainEvent || match.isCoMain ? 'bg-white/10 text-white' : 'bg-[#CDCDCF]/40 text-[#0E1015]'
              }`}
            >
              {match.weightClass || 'Catchweight'}
            </span>
            {match.isTitleFight && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#E5A93C] text-black font-black text-[11px] sports-skew">
                <Trophy className="w-3 h-3 sports-unskew" />
                <span className="sports-unskew">CINTURÓN UFC</span>
              </span>
            )}
            {match.isMainEvent && !match.isTitleFight && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#EC4D25] text-white font-black text-[11px] sports-skew">
                <Flame className="w-3 h-3 sports-unskew" />
                <span className="sports-unskew">ESTELAR</span>
              </span>
            )}
            {match.isCoMain && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#2BCFCE] text-black font-black text-[11px] sports-skew">
                <span className="sports-unskew">CO-ESTELAR</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isLive && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#EC4D25] text-white font-black text-[11px] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>EN VIVO</span>
              </span>
            )}
            {isFinished && (
              <span className="px-2 py-0.5 rounded bg-[#939599]/20 text-[#939599] font-bold text-[11px]">
                FINALIZADO {match.victoryMethod ? `(${match.victoryMethod.replace('_', '/')})` : ''}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-[#0E1015] hover:bg-[#EC4D25] text-white text-[11px] font-bold font-sport uppercase tracking-wider transition-colors shadow-sm"
            >
              <BarChart2 className="w-3 h-3 text-[#2BCFCE]" />
              <span>Stats / Careo</span>
            </button>
          </div>
        </div>

        {/* Fight Face-Off Content */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Red Corner Fighter */}
          <div className="md:col-span-5 flex items-center space-x-3.5">
            <div className="relative shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-lg p-0.5 bg-gradient-to-b from-[#EC4D25] to-[#451408] border-2 border-[#EC4D25] overflow-hidden shadow-md shadow-[#EC4D25]/20 sports-skew">
              <img
                src={red.participant.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                alt={red.participant.displayName}
                className="w-full h-full object-cover object-top sports-unskew"
              />
              {red.isWinner && (
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-black text-center uppercase tracking-wider">
                  WIN
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black tracking-wider text-[#EC4D25] uppercase font-sport">
                ESQUINA ROJA
              </span>
              <div className="flex items-center space-x-2">
                <h4
                  className={`text-lg sm:text-xl font-black truncate font-display uppercase tracking-wide leading-none ${
                    match.isMainEvent || match.isCoMain ? 'text-white' : 'text-[#0E1015]'
                  }`}
                >
                  {red.participant.displayName}
                </h4>
                {red.isWinner && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>

              {red.participant.nickname && (
                <p className="text-xs text-[#EC4D25] font-sport font-bold truncate italic">
                  "{red.participant.nickname}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span
                  className={`text-xs font-sport font-bold ${
                    match.isMainEvent || match.isCoMain ? 'text-[#CDCDCF]' : 'text-[#939599]'
                  }`}
                >
                  RÉCORD: {redStats?.wins ?? 0}-{redStats?.losses ?? 0}-{redStats?.draws ?? 0}
                </span>
                <GymBadge affiliation={redGym} />
              </div>
            </div>

            {/* Red Odd */}
            {red.currentOdd && (
              <div className="text-right shrink-0 bg-[#FAFAFA] border border-[#CDCDCF] px-2.5 py-1 rounded-md shadow-inner">
                <div className="text-xs font-sport font-black text-[#EC4D25]">
                  {red.currentOdd.american}
                </div>
                <div className="text-[10px] text-[#939599] font-sport font-bold">
                  {red.currentOdd.decimal}x
                </div>
              </div>
            )}
          </div>

          {/* Center VS Indicator */}
          <div className="md:col-span-1 text-center flex md:flex-col items-center justify-center py-1">
            <div className="w-8 h-8 rounded-md bg-[#CDCDCF]/40 border border-[#CDCDCF] flex items-center justify-center">
              <span className="text-xs font-black text-[#0E1015] font-sport uppercase tracking-wider">
                VS
              </span>
            </div>
          </div>

          {/* Blue Corner Fighter */}
          <div className="md:col-span-5 flex items-center justify-end space-x-3.5 flex-row-reverse md:flex-row text-right md:text-left">
            {/* Desktop Blue Odd */}
            {blue.currentOdd && (
              <div className="text-left shrink-0 bg-[#FAFAFA] border border-[#CDCDCF] px-2.5 py-1 rounded-md shadow-inner hidden md:block">
                <div className="text-xs font-sport font-black text-[#0A8E8D]">
                  {blue.currentOdd.american}
                </div>
                <div className="text-[10px] text-[#939599] font-sport font-bold">
                  {blue.currentOdd.decimal}x
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black tracking-wider text-[#0A8E8D] uppercase font-sport block md:text-right">
                ESQUINA AZUL
              </span>
              <div className="flex items-center justify-end md:justify-end space-x-2">
                {blue.isWinner && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                <h4
                  className={`text-lg sm:text-xl font-black truncate font-display uppercase tracking-wide leading-none ${
                    match.isMainEvent || match.isCoMain ? 'text-white' : 'text-[#0E1015]'
                  }`}
                >
                  {blue.participant.displayName}
                </h4>
              </div>

              {blue.participant.nickname && (
                <p className="text-xs text-[#0A8E8D] font-sport font-bold truncate italic md:text-right">
                  "{blue.participant.nickname}"
                </p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-1.5 mt-1">
                <span
                  className={`text-xs font-sport font-bold ${
                    match.isMainEvent || match.isCoMain ? 'text-[#CDCDCF]' : 'text-[#939599]'
                  }`}
                >
                  RÉCORD: {blueStats?.wins ?? 0}-{blueStats?.losses ?? 0}-{blueStats?.draws ?? 0}
                </span>
                <GymBadge affiliation={blueGym} />
              </div>
            </div>

            <div className="relative shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-lg p-0.5 bg-gradient-to-b from-[#2BCFCE] to-[#0A3D3C] border-2 border-[#2BCFCE] overflow-hidden shadow-md shadow-[#2BCFCE]/20 sports-skew">
              <img
                src={blue.participant.avatarUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                alt={blue.participant.displayName}
                className="w-full h-full object-cover object-top sports-unskew"
              />
              {blue.isWinner && (
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-black text-center uppercase tracking-wider">
                  WIN
                </div>
              )}
            </div>

            {/* Mobile Blue Odd */}
            {blue.currentOdd && (
              <div className="text-right shrink-0 bg-[#FAFAFA] border border-[#CDCDCF] px-2.5 py-1 rounded-md shadow-inner md:hidden">
                <div className="text-xs font-sport font-black text-[#0A8E8D]">
                  {blue.currentOdd.american}
                </div>
                <div className="text-[10px] text-[#939599] font-sport font-bold">
                  {blue.currentOdd.decimal}x
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaleOfTheTapeModal
        match={match}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

