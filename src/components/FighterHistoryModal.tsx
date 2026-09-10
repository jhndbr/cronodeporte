'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Trophy,
  Dumbbell,
  Calendar,
  Clock,
  Award,
  Flame,
  Swords,
  ShieldAlert,
  Zap,
  CheckCircle2,
  XCircle,
  Activity,
  Target,
} from 'lucide-react';
import { FighterDetailedProfile, PastFight, FighterFightPreview } from '@/core/domain/types';
import { FighterAvatar } from './FighterAvatar';
import { Sparkles, Brain, Bot } from 'lucide-react';

interface FighterHistoryModalProps {
  fighterId: string | null;
  fighterName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FighterHistoryModal({
  fighterId,
  fighterName,
  isOpen,
  onClose,
}: FighterHistoryModalProps) {
  const [profile, setProfile] = useState<FighterDetailedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para 'Cómo llega a la pelea' (IA)
  const [aiPreview, setAiPreview] = useState<FighterFightPreview | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const fetchAiPreview = async () => {
    if (!fighterId) return;
    setLoadingAi(true);
    setShowAiModal(true);
    try {
      const cleanId = fighterId.replace('athlete-', '');
      const res = await fetch(`/api/fighters/${cleanId}/preview`);
      const data = await res.json();
      if (data.success && data.data) {
        setAiPreview(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !fighterId) {
      setProfile(null);
      setAiPreview(null);
      setShowAiModal(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const cleanId = fighterId.replace('athlete-', '');
    fetch(`/api/fighters/${cleanId}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el historial del peleador');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.success && data.data) {
            setProfile(data.data);
          } else {
            setError(data.error || 'Error al obtener datos');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, fighterId]);

  if (!isOpen) return null;

  // Cálculos de tasa de finalización
  const totalWins = profile?.record.wins ?? 0;
  const koWins = profile?.record.koWins ?? 0;
  const subWins = profile?.record.subWins ?? 0;
  const finishWins = koWins + subWins;
  const finishRate = totalWins > 0 ? Math.round((finishWins / totalWins) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-black/75 border border-white/15 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/15 bg-black/60 backdrop-blur-md shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#EC4D25] text-white sports-skew shadow-md shadow-[#EC4D25]/30">
              <Swords className="w-4 h-4 sports-unskew" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase font-sport tracking-widest text-[#2BCFCE] block leading-none">
                Ficha Técnica & Récord Oficial
              </span>
              <span className="text-xs font-bold text-[#939599] font-sport">
                UFC Oficial
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#939599] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-10 h-10 border-3 border-[#EC4D25] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-sport text-[#CDCDCF] uppercase tracking-wider font-bold">
                Cargando historial detallado de {fighterName || 'peleador'}...
              </p>
              <span className="text-[11px] text-[#939599] font-sport">
                Sincronizando récords, métodos y asaltos...
              </span>
            </div>
          ) : error || !profile ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-sport text-red-400 font-bold">{error || 'Información no disponible'}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-sport font-bold hover:bg-white/20"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* 1. Header Profile Banner */}
              <div className="relative p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EC4D25]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative">
                    <FighterAvatar
                      src={profile.avatarUrl}
                      name={profile.displayName}
                      size="xl"
                      side="RED_CORNER"
                    />
                    {profile.countryFlagCode && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-bold uppercase font-sport">
                        {profile.countryFlagCode}
                      </span>
                    )}
                  </div>

                  <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {profile.weightClass && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EC4D25]/20 text-[#EC4D25] border border-[#EC4D25]/30 font-sport font-bold text-[11px] uppercase tracking-wider">
                          {profile.weightClass}
                        </span>
                      )}
                      {profile.country && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#CDCDCF] font-sport font-semibold text-[11px] uppercase tracking-wider">
                          {profile.country}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-wide leading-tight">
                      {profile.displayName}
                    </h2>

                    {profile.nickname && (
                      <p className="text-sm sm:text-base font-sport font-bold italic text-[#2BCFCE]">
                        &ldquo;{profile.nickname}&rdquo;
                      </p>
                    )}

                    {profile.gym && (
                      <div className="inline-flex items-center space-x-1.5 text-xs text-[#CDCDCF] font-sport pt-1 font-bold">
                        <Dumbbell className="w-3.5 h-3.5 text-[#EC4D25]" />
                        <span>{profile.gym}</span>
                      </div>
                    )}
                  </div>

                  {/* Big Record Pill & Botón Cómo llega a la pelea */}
                  <div className="flex flex-col items-center sm:items-end gap-2.5 shrink-0">
                    <div className="text-center bg-black/60 px-5 py-3.5 rounded-2xl border border-white/10 shadow-lg min-w-[170px]">
                      <span className="text-[10px] uppercase font-sport font-bold text-[#939599] tracking-widest block">
                        RÉCORD PROFESIONAL
                      </span>
                      <p className="text-2xl sm:text-3xl font-black text-white font-display tracking-wider">
                        {profile.record.wins} - {profile.record.losses} - {profile.record.draws}
                      </p>
                      <span className="text-[10px] font-sport font-bold text-[#2BCFCE] tracking-wider uppercase">
                        {finishRate}% Tasa de Finalización
                      </span>
                    </div>

                    {/* BOTÓN CÓMO LLEGA A LA PELEA (IA) */}
                    <button
                      onClick={fetchAiPreview}
                      disabled={loadingAi}
                      className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#EC4D25] to-[#E5A93C] hover:opacity-95 text-white font-sport font-black text-xs uppercase tracking-wider shadow-lg shadow-[#EC4D25]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>{loadingAi ? 'Analizando con IA...' : '¿Cómo llega a la pelea?'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD EXPANDIBLE: ANÁLISIS GENERADO CON IA (GOOGLE GEMINI) */}
              {showAiModal && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-black/80 to-[#12151D] border-2 border-[#EC4D25]/50 shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-[#EC4D25] text-white sports-skew shadow-md">
                        <Brain className="w-4 h-4 sports-unskew" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black font-sport uppercase text-white tracking-wider">
                            Informe de Preparación & Momento Actual
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-[#2BCFCE] border border-white/15 font-sport uppercase">
                            {aiPreview?.sourceModel || 'Google Gemini AI'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sport">
                          Consulta semanal generada por evento • {aiPreview?.opponentName ? `vs ${aiPreview.opponentName}` : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAiModal(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 text-xs font-sport uppercase"
                    >
                      Ocultar
                    </button>
                  </div>

                  {loadingAi ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="w-8 h-8 border-2 border-[#EC4D25] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-sport text-slate-300">
                        Consultando modelo de Inteligencia Artificial para {profile.displayName}...
                      </p>
                    </div>
                  ) : aiPreview ? (
                    <div className="space-y-3.5">
                      {/* Resumen Principal */}
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sport">
                        {aiPreview.summaryText}
                      </p>

                      {/* Factores Clave */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-slate-400 font-sport block">Inactividad / Tiempo</span>
                          <span className="text-xs font-bold text-[#2BCFCE] font-sport">{aiPreview.keyFactors.inactivityTime || 'Activo'}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-slate-400 font-sport block">Aviso / Sustitución</span>
                          <span className="text-xs font-bold font-sport text-white">
                            {aiPreview.keyFactors.isShortNotice ? '⚠️ Reemplazo de último llamado' : '✅ Campamento completo programado'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-slate-400 font-sport block">Preparación en Gimnasio</span>
                          <span className="text-xs font-bold text-[#E5A93C] font-sport truncate block">
                            {aiPreview.keyFactors.campStatus || profile.gym || 'Alto Rendimiento'}
                          </span>
                        </div>
                      </div>

                      {/* Bullets de Inteligencia */}
                      {aiPreview.bullets && aiPreview.bullets.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sport block">
                            Puntos Críticos del Combate:
                          </span>
                          <ul className="space-y-1 text-xs font-sport text-slate-300">
                            {aiPreview.bullets.map((b, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <span className="text-[#EC4D25] font-black">▸</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-sport text-slate-400 text-center py-4">
                      No se pudo generar el análisis en este momento. Inténtalo de nuevo.
                    </div>
                  )}
                </div>
              )}

              {/* 2. Breakdown of Wins & Losses by Method (Desglose Solicitado) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Victorias por Método */}
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase font-sport tracking-wider text-emerald-400">
                        Victorias ({profile.record.wins})
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-sport">
                      Total: {profile.record.wins}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sport">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#CDCDCF] flex items-center space-x-1.5">
                        <span>🥊</span>
                        <span className="font-bold">Victorias por KO/TKO:</span>
                      </span>
                      <span className="font-black text-emerald-400 text-sm">
                        {profile.record.koWins ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#CDCDCF] flex items-center space-x-1.5">
                        <span>🥋</span>
                        <span className="font-bold">Victorias por Sumisión:</span>
                      </span>
                      <span className="font-black text-emerald-400 text-sm">
                        {profile.record.subWins ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#CDCDCF] flex items-center space-x-1.5">
                        <span>⚖️</span>
                        <span className="font-bold">Victorias por Decisión:</span>
                      </span>
                      <span className="font-black text-emerald-400 text-sm">
                        {profile.record.decWins ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Derrotas por Método */}
                <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-black uppercase font-sport tracking-wider text-red-400">
                        Derrotas ({profile.record.losses})
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-sport">
                      Total: {profile.record.losses}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sport">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#CDCDCF] flex items-center space-x-1.5">
                        <span>💥</span>
                        <span className="font-bold">Derrotas por KO/TKO:</span>
                      </span>
                      <span className="font-black text-red-400 text-sm">
                        {profile.record.koLosses ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#CDCDCF] flex items-center space-x-1.5">
                        <span>🔒</span>
                        <span className="font-bold">Derrotas por Sumisión:</span>
                      </span>
                      <span className="font-black text-red-400 text-sm">
                        {profile.record.subLosses ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#CDCDCF] flex items-center space-x-1.5">
                        <span>⚖️</span>
                        <span className="font-bold">Derrotas por Decisión:</span>
                      </span>
                      <span className="font-black text-red-400 text-sm">
                        {profile.record.decLosses ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Physical Biometrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md text-center">
                  <span className="text-[10px] font-sport text-[#939599] uppercase font-bold block">Altura</span>
                  <span className="text-base font-black text-white font-sport">{profile.height || '-'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md text-center">
                  <span className="text-[10px] font-sport text-[#939599] uppercase font-bold block">Peso</span>
                  <span className="text-base font-black text-white font-sport">{profile.weight || '-'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md text-center">
                  <span className="text-[10px] font-sport text-[#939599] uppercase font-bold block">Alcance</span>
                  <span className="text-base font-black text-white font-sport">{profile.reach || '-'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md text-center">
                  <span className="text-[10px] font-sport text-[#939599] uppercase font-bold block">Guardia</span>
                  <span className="text-base font-black text-white font-sport">{profile.stance || 'Orthodox'}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md text-center">
                  <span className="text-[10px] font-sport text-[#939599] uppercase font-bold block">Edad</span>
                  <span className="text-base font-black text-white font-sport">{profile.age ? `${profile.age} años` : '-'}</span>
                </div>
              </div>

              {/* 4. Recent Form Streak */}
              {profile.recentFights && profile.recentFights.length > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md">
                  <div className="flex items-center space-x-2 text-xs font-sport font-bold text-[#CDCDCF] uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-[#EC4D25]" />
                    <span>Racha de Combates Recientes:</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {profile.recentFights.slice(0, 5).map((f, i) => (
                      <span
                        key={i}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-sport transition-transform hover:scale-110 ${
                          f.isWinner
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20'
                        }`}
                        title={`${f.isWinner ? 'Victoria' : 'Derrota'} vs ${f.opponentName}`}
                      >
                        {f.isWinner ? 'W' : 'L'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Detailed Past Fights Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#CDCDCF] font-sport flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#EC4D25]" />
                    <span>Historial Detallado de Combates</span>
                  </h4>
                  <span className="text-[11px] font-sport font-bold text-[#939599]">
                    {profile.recentFights.length} peleas registradas
                  </span>
                </div>

                {profile.recentFights.length === 0 ? (
                  <p className="text-xs font-sport text-[#939599] italic text-center py-6 bg-[#12151D] rounded-2xl border border-white/5">
                    No se registraron combates anteriores para este atleta.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {profile.recentFights.map((fight, idx) => (
                      <DetailedFightCard key={fight.id || idx} fight={fight} index={idx} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Tarjeta detallada individual para cada pelea del historial.
 * Muestra: Resultado (W/L), Rival, Método, Técnica/Golpe, Asalto y Reloj, Evento UFC y Fecha.
 */
function DetailedFightCard({ fight, index }: { fight: PastFight; index: number }) {
  const dateFormatted = fight.eventDate
    ? new Date(fight.eventDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 overflow-hidden ${
        fight.isWinner
          ? 'bg-black/60 border-emerald-500/35 hover:border-emerald-500/60 backdrop-blur-md'
          : 'bg-black/60 border-red-500/35 hover:border-red-500/60 backdrop-blur-md'
      }`}
    >
      {/* Top Banner Row: Resultado + Nombre del Evento + Fecha */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          {/* Resultado Badge */}
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-black font-sport uppercase tracking-wider ${
              fight.isWinner
                ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/30'
                : 'bg-red-500 text-white shadow-sm shadow-red-500/30'
            }`}
          >
            {fight.isWinner ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Victoria (W)</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                <span>Derrota (L)</span>
              </>
            )}
          </span>

          {/* Event Name */}
          <span className="text-xs sm:text-sm font-black text-white font-sport uppercase tracking-wide">
            {fight.eventName}
          </span>
        </div>

        {/* Event Date */}
        {dateFormatted && (
          <div className="flex items-center space-x-1 text-[11px] font-sport text-[#939599]">
            <Calendar className="w-3 h-3 text-[#CDCDCF]" />
            <span>{dateFormatted}</span>
          </div>
        )}
      </div>

      {/* Middle Row: Rival Information */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {fight.opponentAvatarUrl ? (
              <img
                src={fight.opponentAvatarUrl}
                alt={fight.opponentName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xs font-black font-sport text-[#939599]">VS</span>
            )}
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-sport text-[#939599] uppercase font-bold block">
              Rival / Oponente
            </span>
            <p className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wide truncate">
              {fight.opponentName}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Método, Detalle del Golpe/Técnica, Asalto y Tiempo */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs font-sport">
        {/* Método de Definición */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[#CDCDCF]">
          <span className="text-[#939599] font-bold">Método:</span>
          <span className="font-black text-white">{fight.method}</span>
        </div>

        {/* Detalle del Golpe / Técnica */}
        {fight.methodDetail && (
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#EC4D25]/15 border border-[#EC4D25]/30 text-white">
            <Target className="w-3 h-3 text-[#EC4D25]" />
            <span className="text-[#CDCDCF] font-bold">Técnica:</span>
            <span className="font-black text-[#EC4D25]">{fight.methodDetail}</span>
          </div>
        )}

        {/* Asalto y Tiempo */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[#CDCDCF] ml-auto">
          <Clock className="w-3 h-3 text-[#2BCFCE]" />
          {fight.round && (
            <span className="font-black text-white">
              Asalto {fight.round}
            </span>
          )}
          {fight.time && (
            <span className="text-[#2BCFCE] font-bold">
              ({fight.time})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
