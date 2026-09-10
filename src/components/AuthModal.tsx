'use client';

import React, { useState } from 'react';
import { X, Flame, Shield, UserCheck, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginAsGuest, loading } = useUser();
  const [guestName, setGuestName] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    await loginWithGoogle();
    onClose();
  };

  const handleGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginAsGuest(guestName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-black/85 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EC4D25] flex items-center justify-center shadow-lg shadow-[#EC4D25]/40 sports-skew">
            <Flame className="w-6 h-6 text-white sports-unskew" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display uppercase tracking-tight">
              CRONO<span className="text-[#EC4D25]">PORTE</span> UFC
            </h2>
            <p className="text-xs font-sport text-slate-300 uppercase tracking-wider mt-1">
              Simulador de Predicciones & Récords
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 text-center mb-6 leading-relaxed">
          Inicia sesión para registrar tus pronósticos, competir en el ranking de aciertos y armar combos en cada cartelera oficial.
        </p>

        {/* Botón de Google OAuth */}
        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold font-sport text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10" />
            <span className="px-3 text-[10px] font-sport text-slate-400 uppercase tracking-widest">O</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* Acceso Rápido / Modo Invitado */}
          {!showGuestInput ? (
            <button
              onClick={() => setShowGuestInput(true)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-sport font-bold text-xs uppercase tracking-wider transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#2BCFCE]" />
              <span>Acceso Rápido con Apodo</span>
            </button>
          ) : (
            <form onSubmit={handleGuest} className="space-y-2 animate-in fade-in duration-150">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Escribe tu apodo o nombre..."
                required
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-slate-400 text-xs font-sport focus:outline-none focus:border-[#EC4D25]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Entrar a Pronosticar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center space-x-1.5 text-[10px] font-sport text-slate-400 uppercase tracking-widest">
          <Shield className="w-3 h-3 text-[#2BCFCE]" />
          <span>Simulador Gratuito • Sin Dinero Real</span>
        </div>
      </div>
    </div>
  );
}
