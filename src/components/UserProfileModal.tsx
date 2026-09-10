'use client';

import React from 'react';
import { X, Trophy, CheckCircle2, XCircle, Clock, Award, LogOut, Flame, Layers } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, tickets, logout } = useUser();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-black/85 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 bg-black/60 shrink-0">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-[#EC4D25] object-cover bg-black/40"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black font-display uppercase tracking-wide leading-none text-white">
                  {user.name}
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-[#2BCFCE] border border-white/15 font-sport uppercase">
                  {user.provider}
                </span>
              </div>
              <p className="text-[11px] font-sport text-slate-400 mt-0.5">
                {user.email || 'Pronosticador Oficial UFC'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-sport font-bold flex items-center space-x-1 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-sport uppercase text-slate-400 font-bold">Total Picks</span>
              <span className="text-2xl font-black font-display mt-0.5 text-white">{user.stats.totalPredictions}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-sport uppercase text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Acertadas</span>
              </span>
              <span className="text-2xl font-black font-display mt-0.5 text-emerald-400">{user.stats.correct}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-sport uppercase text-red-400 font-bold flex items-center space-x-1">
                <XCircle className="w-3 h-3" />
                <span>Falladas</span>
              </span>
              <span className="text-2xl font-black font-display mt-0.5 text-red-400">{user.stats.incorrect}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EC4D25]/15 border border-[#EC4D25]/30 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-sport uppercase text-[#EC4D25] font-bold flex items-center space-x-1">
                <Trophy className="w-3 h-3" />
                <span>Efectividad</span>
              </span>
              <span className="text-2xl font-black font-display mt-0.5 text-[#EC4D25]">{user.stats.accuracyRate}%</span>
            </div>
          </div>

          {/* Historial de Boletos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black font-sport uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-[#2BCFCE]" />
                <span>Historial de Boletos & Combos ({tickets.length})</span>
              </h4>
            </div>

            {tickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-sport text-xs">
                Aún no has registrado predicciones. ¡Dirígete a la cartelera y selecciona a tus favoritos!
              </div>
            ) : (
              <div className="space-y-2.5">
                {tickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-sport">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            tkt.type === 'COMBO'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {tkt.type === 'COMBO' ? `COMBO (${tkt.picks.length} peleas)` : 'INDIVIDUAL'}
                        </span>
                        <span className="text-slate-400">
                          {new Date(tkt.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] uppercase flex items-center space-x-1 ${
                          tkt.status === 'WON'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : tkt.status === 'LOST'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {tkt.status === 'WON' && <CheckCircle2 className="w-3 h-3" />}
                        {tkt.status === 'LOST' && <XCircle className="w-3 h-3" />}
                        {tkt.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        <span>{tkt.status === 'WON' ? 'ACERTADO' : tkt.status === 'LOST' ? 'FALLADO' : 'PENDIENTE'}</span>
                      </span>
                    </div>

                    {/* Lista de peleas del boleto */}
                    <div className="divide-y divide-white/5 pt-1">
                      {tkt.picks.map((pick, i) => (
                        <div key={i} className="py-1.5 flex items-center justify-between text-xs font-sport">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-[10px]">#{i + 1}</span>
                            <span className="font-bold text-white">{pick.selectedFighterName}</span>
                            <span className="text-slate-400 text-[10px]">vs {pick.opponentFighterName}</span>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase ${
                              pick.status === 'CORRECT'
                                ? 'text-emerald-400'
                                : pick.status === 'INCORRECT'
                                ? 'text-red-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {pick.status === 'CORRECT'
                              ? 'Ganador'
                              : pick.status === 'INCORRECT'
                              ? 'Perdido'
                              : 'Por pelear'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
