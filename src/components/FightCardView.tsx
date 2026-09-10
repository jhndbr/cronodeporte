'use client';

import React, { useState } from 'react';
import { Match, MatchSegment, BoutPick } from '../core/domain/types';
import { BoutCard } from './BoutCard';
import { Swords, ArrowDownUp, CheckCircle2, Layers, Flame, Trash2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { AuthModal } from './AuthModal';

export type FightCardSortOrder = 'MAIN_EVENT_FIRST' | 'CHRONOLOGICAL';

interface FightCardViewProps {
  matches: Match[];
}

export function FightCardView({ matches }: FightCardViewProps) {
  const { user, submitPredictionTicket } = useUser();
  const [sortOrder, setSortOrder] = useState<FightCardSortOrder>('MAIN_EVENT_FIRST');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | MatchSegment>('ALL');

  // Estado del ticket activo de predicciones
  const [selectedPicks, setSelectedPicks] = useState<Record<string, BoutPick>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSelectWinner = (match: Match, side: 'RED_CORNER' | 'BLUE_CORNER') => {
    const red = match.participants.find((p) => p.side === 'RED_CORNER');
    const blue = match.participants.find((p) => p.side === 'BLUE_CORNER');
    if (!red || !blue) return;

    setSelectedPicks((prev) => {
      const current = prev[match.id];
      // Si ya estaba seleccionado el mismo, deseleccionar
      if (current && current.selectedSide === side) {
        const copy = { ...prev };
        delete copy[match.id];
        return copy;
      }

      const selected = side === 'RED_CORNER' ? red : blue;
      const opponent = side === 'RED_CORNER' ? blue : red;

      return {
        ...prev,
        [match.id]: {
          matchId: match.id,
          eventName: 'UFC Cartelera',
          selectedSide: side,
          selectedFighterId: selected.participant.id,
          selectedFighterName: selected.participant.displayName,
          opponentFighterId: opponent.participant.id,
          opponentFighterName: opponent.participant.displayName,
          status: 'PENDING',
        },
      };
    });
  };

  const clearPicks = () => {
    setSelectedPicks({});
  };

  const picksList = Object.values(selectedPicks);

  const handleSubmitPredictions = async (type: 'SINGLE' | 'COMBO') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (picksList.length === 0) return;

    setIsSubmitting(true);
    const ok = await submitPredictionTicket(type, picksList);
    setIsSubmitting(false);

    if (ok) {
      setSuccessMessage(
        type === 'COMBO'
          ? `¡Combo de ${picksList.length} peleas registrado con éxito! Consulta tu récord en el perfil.`
          : `¡Predicción individual confirmada! Consulta tu récord en el perfil.`
      );
      setSelectedPicks({});
      setTimeout(() => setSuccessMessage(null), 5000);
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
              Cartelera Completa & Simulador
            </h2>
            <p className="text-xs font-sport text-slate-500 uppercase tracking-wider">
              {matches.length} Peleas Programadas • Elige ganadores por pelea individual o en combo
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

      {/* Mensaje de Confirmación Exitosa */}
      {successMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-sport font-bold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-sport font-bold text-emerald-700">
            OK
          </button>
        </div>
      )}

      {/* Barra Flotante / Panel de Ticket de Predicciones cuando hay selecciones */}
      {picksList.length > 0 && (
        <div className="sticky top-20 z-40 p-4 rounded-2xl bg-[#090B0E]/95 border-2 border-[#EC4D25] shadow-2xl backdrop-blur-xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#EC4D25] text-white sports-skew shadow-md">
              <Layers className="w-4 h-4 sports-unskew" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black font-display uppercase tracking-wide">
                  Ticket de Predicción: {picksList.length} {picksList.length === 1 ? 'Pelea' : 'Peleas'}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10 text-[#2BCFCE] uppercase font-sport">
                  {picksList.length > 1 ? 'Modo Combo / Parlay' : 'Modo Individual'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sport">
                {picksList.map((p) => p.selectedFighterName).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={clearPicks}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-sport transition-colors"
              title="Limpiar selecciones"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {picksList.length === 1 ? (
              <button
                onClick={() => handleSubmitPredictions('SINGLE')}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar Pronóstico'}
              </button>
            ) : (
              <div className="flex items-center space-x-2 flex-1 sm:flex-none">
                <button
                  onClick={() => handleSubmitPredictions('SINGLE')}
                  disabled={isSubmitting}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Picks Individuales
                </button>
                <button
                  onClick={() => handleSubmitPredictions('COMBO')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4D25] to-[#E5A93C] hover:opacity-95 text-white font-sport font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#EC4D25]/30 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : `Confirmar Combo (${picksList.length}X)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista Limpia de Combates */}
      <div className="space-y-3">
        {filteredMatches.map((match) => (
          <BoutCard
            key={match.id}
            match={match}
            index={match.orderIndex}
            onOpenCareo={() => handleOpenCareo(match.id)}
            selectedWinnerSide={selectedPicks[match.id]?.selectedSide || null}
            onSelectWinner={(side) => handleSelectWinner(match, side)}
          />
        ))}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </section>
  );
}
