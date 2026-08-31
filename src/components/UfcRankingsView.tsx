'use client';

import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, TrendingDown, Minus, ShieldCheck, ChevronRight, User, Globe } from 'lucide-react';
import { UfcRankingsCategory } from '../core/domain/types';

interface UfcRankingsViewProps {
  rankings: UfcRankingsCategory[];
}

export function UfcRankingsView({ rankings }: UfcRankingsViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    rankings[0]?.slug || 'pound-for-pound'
  );

  const currentCategory = rankings.find((r) => r.slug === selectedSlug) || rankings[0];

  if (!rankings || rankings.length === 0) return null;

  return (
    <section id="rankings" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#CDCDCF] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/30 sports-skew">
            <Trophy className="w-6 h-6 sports-unskew" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                RANKINGS OFICIALES UFC
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#0E1015] text-[#2BCFCE] font-sport font-black text-xs uppercase tracking-wider sports-skew">
                <span className="sports-unskew">PANEL OFICIAL ESPN</span>
              </span>
            </div>
            <p className="text-xs font-sport font-bold text-[#939599] uppercase tracking-widest block -mt-1">
              Clasificación mundial por divisiones de peso • Campeones y contendientes Top 10
            </p>
          </div>
        </div>
      </div>

      {/* Division Selector Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {rankings.map((cat) => (
          <button
            key={cat.id || cat.slug}
            onClick={() => setSelectedSlug(cat.slug)}
            className={`px-4 py-2 rounded-lg font-sport font-black text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all sports-skew flex items-center space-x-1.5 ${
              selectedSlug === cat.slug
                ? 'bg-[#0E1015] text-[#2BCFCE] shadow-md shadow-black/20 border-2 border-[#2BCFCE]'
                : 'bg-white text-[#0E1015] hover:bg-[#EAECEF] border border-[#CDCDCF]'
            }`}
          >
            {cat.isP4P && <Award className="w-3.5 h-3.5 text-[#E5A93C] sports-unskew" />}
            <span className="sports-unskew">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Category Content Area */}
      {currentCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Champion Banner Card (if division has a champion) */}
          {currentCategory.champion && (
            <div className="lg:col-span-4 bg-gradient-to-b from-[#1E170A] via-[#151821] to-[#0E1015] rounded-2xl border-2 border-[#E5A93C] p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5A93C]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded bg-[#E5A93C] text-black font-sport font-black text-xs uppercase tracking-widest sports-skew flex items-center space-x-1 shadow-md">
                  <Trophy className="w-3.5 h-3.5 sports-unskew" />
                  <span className="sports-unskew">CAMPEÓN VIGENTE</span>
                </span>
                {currentCategory.champion.defenses !== undefined && (
                  <span className="text-xs font-sport font-bold text-[#E5A93C] uppercase tracking-wider">
                    {currentCategory.champion.defenses} Defensas
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center text-center my-4">
                <div className="relative w-36 h-36 rounded-2xl p-1 bg-gradient-to-b from-[#E5A93C] to-[#5C3F08] border-2 border-[#E5A93C] overflow-hidden shadow-xl shadow-[#E5A93C]/20 sports-skew mb-4">
                  <img
                    src={currentCategory.champion.headshotUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                    alt={currentCategory.champion.displayName}
                    className="w-full h-full object-cover object-top sports-unskew"
                  />
                </div>

                <span className="text-xs font-black tracking-widest text-[#E5A93C] font-sport uppercase">
                  {currentCategory.name}
                </span>

                <h3 className="text-3xl font-black text-white font-display uppercase tracking-wide leading-none mt-1">
                  {currentCategory.champion.displayName}
                </h3>

                {currentCategory.champion.nickname && (
                  <p className="text-xs text-[#E5A93C] font-sport font-bold italic tracking-wider mt-0.5">
                    "{currentCategory.champion.nickname}"
                  </p>
                )}

                <div className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1 rounded-md bg-white/10 border border-white/10 text-xs font-sport text-[#CDCDCF] font-bold">
                  <span>RÉCORD: <b className="text-white">{currentCategory.champion.recordSummary}</b></span>
                  {currentCategory.champion.countryCode && (
                    <span>• {currentCategory.champion.countryCode}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ranked Contenders Grid (#1 to #10) */}
          <div className={`${currentCategory.champion ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-2.5`}>
            <div className="flex items-center justify-between px-4 py-2 bg-[#EAECEF] rounded-lg border border-[#CDCDCF] text-xs font-sport font-black text-[#939599] uppercase tracking-wider">
              <span className="w-12">RANGO</span>
              <span className="flex-1">PELEADOR / CONTENDIENTE</span>
              <span className="w-24 text-center">RÉCORD</span>
              <span className="w-16 text-right">TENDENCIA</span>
            </div>

            <div className="space-y-2">
              {currentCategory.fighters.map((f) => {
                const isTop3 = f.rank <= 3;
                return (
                  <div
                    key={f.fighterId || f.displayName}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all bg-white hover:border-[#2BCFCE] shadow-sm ${
                      isTop3 ? 'border-[#CDCDCF]' : 'border-[#EAECEF]'
                    }`}
                  >
                    {/* Rank Number */}
                    <div className="w-12 flex items-center">
                      <span
                        className={`text-xl font-black font-display ${
                          f.rank === 1
                            ? 'text-[#EC4D25]'
                            : f.rank === 2
                            ? 'text-[#2BCFCE]'
                            : f.rank === 3
                            ? 'text-[#E5A93C]'
                            : 'text-[#939599]'
                        }`}
                      >
                        #{f.rank}
                      </span>
                    </div>

                    {/* Fighter Name, Headshot & Country */}
                    <div className="flex-1 flex items-center space-x-3 min-w-0 pr-2">
                      <div className="relative shrink-0 w-12 h-12 rounded-lg p-0.5 bg-[#EAECEF] border border-[#CDCDCF] overflow-hidden">
                        <img
                          src={f.headshotUrl || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png'}
                          alt={f.displayName}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-black text-[#0E1015] font-display uppercase tracking-wide truncate">
                            {f.displayName}
                          </h4>
                          {f.isChampion && (
                            <span className="px-1.5 py-0.2 rounded bg-[#E5A93C] text-black font-black text-[9px] font-sport uppercase">
                              CINTURÓN
                            </span>
                          )}
                        </div>
                        {f.nickname && (
                          <p className="text-xs text-[#939599] font-sport italic truncate">
                            "{f.nickname}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Record */}
                    <div className="w-24 text-center font-sport font-black text-xs text-[#0E1015]">
                      {f.recordSummary}
                    </div>

                    {/* Trend */}
                    <div className="w-16 flex items-center justify-end font-sport font-black text-xs">
                      {f.trend?.includes('+') || f.trend === '1' ? (
                        <span className="inline-flex items-center text-emerald-600 space-x-0.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{f.trend}</span>
                        </span>
                      ) : f.trend?.includes('-') && f.trend !== '-' ? (
                        <span className="inline-flex items-center text-[#EC4D25] space-x-0.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{f.trend}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[#939599]">
                          <Minus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
