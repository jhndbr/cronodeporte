'use client';

import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, TrendingDown, Minus, ShieldCheck, Sparkles } from 'lucide-react';
import { UfcRankingsCategory } from '../core/domain/types';
import { FighterAvatar } from './FighterAvatar';

interface UfcRankingsViewProps {
  rankings: UfcRankingsCategory[];
}

export function UfcRankingsView({ rankings }: UfcRankingsViewProps) {
  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE'>('MALE');
  
  // Categorías filtradas por género
  const genderCategories = rankings.filter((r) => r.gender === selectedGender);

  const [selectedSlug, setSelectedSlug] = useState<string>(
    rankings[0]?.slug || 'pound-for-pound'
  );

  // Asegurar que si cambiamos de género y la categoría no existe en el nuevo género, se seleccione la primera
  const currentCategory =
    genderCategories.find((r) => r.slug === selectedSlug) ||
    genderCategories[0] ||
    rankings[0];

  if (!rankings || rankings.length === 0) return null;

  return (
    <section id="rankings" className="space-y-5 pt-2">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CDCDCF] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#E5A93C] text-black">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                Rankings Oficiales UFC
              </h2>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-sport font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>2025/2026</span>
              </span>
            </div>
            <p className="text-xs font-sport text-[#939599] uppercase tracking-wider">
              Panel oficial de medios y panelistas de UFC • Top 15 por división
            </p>
          </div>
        </div>

        {/* Gender Toggle Selector */}
        <div className="flex items-center space-x-1 bg-[#F2F3F5] p-1 rounded-lg border border-[#CDCDCF]">
          <button
            onClick={() => {
              setSelectedGender('MALE');
              setSelectedSlug('pound-for-pound');
            }}
            className={`px-3.5 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-colors ${
              selectedGender === 'MALE'
                ? 'bg-[#0E1015] text-[#2BCFCE]'
                : 'text-[#939599] hover:text-[#0E1015]'
            }`}
          >
            Masculino ({rankings.filter((r) => r.gender === 'MALE').length})
          </button>
          <button
            onClick={() => {
              setSelectedGender('FEMALE');
              setSelectedSlug('women-pound-for-pound');
            }}
            className={`px-3.5 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-colors ${
              selectedGender === 'FEMALE'
                ? 'bg-[#0E1015] text-[#EC4D25]'
                : 'text-[#939599] hover:text-[#0E1015]'
            }`}
          >
            Femenino ({rankings.filter((r) => r.gender === 'FEMALE').length})
          </button>
        </div>
      </div>

      {/* Division Selector Filter Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {genderCategories.map((cat) => {
          const isSelected = currentCategory?.slug === cat.slug;
          return (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedSlug(cat.slug)}
              className={`px-3 py-1.5 rounded font-sport font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors flex items-center space-x-1 border ${
                isSelected
                  ? cat.isP4P
                    ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                    : 'bg-[#0E1015] text-[#2BCFCE] border-[#0E1015]'
                  : 'bg-white text-[#0E1015] hover:bg-[#F2F3F5] border-[#CDCDCF]'
              }`}
            >
              {cat.isP4P && <Award className="w-3.5 h-3.5" />}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Content Area */}
      {currentCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Champion Banner Card */}
          {currentCategory.champion && (
            <div className="lg:col-span-4 bg-[#0E1015] rounded-2xl border border-[#E5A93C]/40 p-6 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5A93C]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded bg-[#E5A93C] text-black font-sport font-black text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>CAMPEÓN UFC</span>
                </span>
                {currentCategory.champion.defenses !== undefined && (
                  <span className="text-xs font-sport font-black text-[#E5A93C] uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded border border-[#E5A93C]/20">
                    {currentCategory.champion.defenses} {currentCategory.champion.defenses === 1 ? 'Defensa' : 'Defensas'}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center text-center my-3">
                <div className="relative mb-4">
                  <FighterAvatar
                    src={currentCategory.champion.headshotUrl}
                    name={currentCategory.champion.displayName}
                    side="CHAMPION"
                    size="2xl"
                    className="ring-2 ring-[#E5A93C]/60"
                  />
                </div>

                <span className="text-xs font-black tracking-widest text-[#E5A93C] font-sport uppercase">
                  {currentCategory.name}
                </span>

                <h3 className="text-3xl font-black text-white font-display uppercase tracking-wide leading-none mt-1">
                  {currentCategory.champion.displayName}
                </h3>

                {currentCategory.champion.nickname && (
                  <p className="text-sm text-[#E5A93C] font-sport font-semibold italic mt-1">
                    &ldquo;{currentCategory.champion.nickname}&rdquo;
                  </p>
                )}

                <div className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1 rounded-lg bg-white/8 text-xs font-sport text-[#CDCDCF] font-bold border border-white/10">
                  <span>Récord: <b className="text-white">{currentCategory.champion.recordSummary}</b></span>
                  {currentCategory.champion.countryCode && (
                    <span>• {currentCategory.champion.countryCode}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ranked Contenders Grid */}
          <div className={`${currentCategory.champion ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-2`}>
            {/* Cabecera de la tabla */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#F2F3F5] rounded-lg border border-[#CDCDCF] text-xs font-sport font-black text-[#939599] uppercase tracking-wider">
              <span className="w-12">RANGO</span>
              <span className="flex-1">PELEADOR</span>
              <span className="w-24 text-center">RÉCORD</span>
              <span className="w-16 text-right">TENDENCIA</span>
            </div>

            {/* Lista de Peleadores */}
            <div className="space-y-1.5">
              {currentCategory.fighters.map((f) => {
                const isP4PChampion = f.isChampion && currentCategory.isP4P;

                return (
                  <div
                    key={f.fighterId || f.displayName}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#CDCDCF]/80 transition-colors bg-white hover:bg-[#FAFAFA]"
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

                    {/* Fighter Name, Avatar */}
                    <div className="flex-1 flex items-center space-x-3 min-w-0 pr-2">
                      <FighterAvatar
                        src={f.headshotUrl}
                        name={f.displayName}
                        size="sm"
                        side={f.isChampion ? 'CHAMPION' : 'NEUTRAL'}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm sm:text-base font-black text-[#0E1015] font-display uppercase tracking-wide truncate">
                            {f.displayName}
                          </h4>
                          {isP4PChampion && (
                            <span className="px-1.5 py-0.5 rounded bg-[#E5A93C] text-black font-black text-[9px] font-sport uppercase">
                              CAMPEÓN
                            </span>
                          )}
                          {f.countryCode && (
                            <span className="text-[10px] text-[#939599] font-sport font-bold">
                              {f.countryCode}
                            </span>
                          )}
                        </div>
                        {f.nickname && (
                          <p className="text-xs text-[#939599] font-sport italic truncate">
                            &ldquo;{f.nickname}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Record */}
                    <div className="w-24 text-center font-sport font-bold text-xs text-[#0E1015]">
                      {f.recordSummary}
                    </div>

                    {/* Trend */}
                    <div className="w-16 flex items-center justify-end font-sport font-black text-xs">
                      {f.trend?.includes('+') ? (
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
