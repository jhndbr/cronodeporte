'use client';

import React, { useState } from 'react';
import { X, Flame, Shield, UserCheck, ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginAsGuest, loginWithCredentials, registerWithCredentials, loading } = useUser();
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guest inputs
  const [guestName, setGuestName] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);

  // Credentials inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setErrorMessage(null);
    await loginWithGoogle();
    onClose();
  };

  const handleGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    await loginAsGuest(guestName);
    onClose();
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegistering) {
      const res = await registerWithCredentials(email, password, name);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Error al crear la cuenta');
      }
    } else {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas');
      }
    }
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
        <div className="flex flex-col items-center text-center space-y-2 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#EC4D25] flex items-center justify-center shadow-lg shadow-[#EC4D25]/40 sports-skew">
            <Flame className="w-6 h-6 text-white sports-unskew" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display uppercase tracking-tight">
              CRONO<span className="text-[#EC4D25]">PORTE</span> UFC
            </h2>
            <p className="text-xs font-sport text-slate-300 uppercase tracking-wider mt-0.5">
              Simulador de Predicciones & Récords
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 mb-5 bg-white/5 rounded-xl border border-white/10 text-xs font-sport uppercase tracking-wider font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'quick' ? 'bg-[#EC4D25] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Acceso Rápido
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('credentials');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'credentials' ? 'bg-[#EC4D25] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mi Cuenta
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs font-sport animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: ACCESO RÁPIDO (Google / Invitado) */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed font-sport">
              Comienza a pronosticar de inmediato sin necesidad de contraseñas.
            </p>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold font-sport text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
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

            <div className="flex items-center my-3">
              <div className="flex-grow border-t border-white/10" />
              <span className="px-3 text-[10px] font-sport text-slate-400 uppercase tracking-widest">O</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

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
                  placeholder="Escribe tu apodo o alias..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white placeholder-slate-400 text-xs font-sport focus:outline-none focus:border-[#EC4D25]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  <span>Entrar a Pronosticar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: MI CUENTA (Email y Password) */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-3 animate-in fade-in duration-150">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[11px] font-sport text-slate-400 uppercase tracking-wider">Nombre o Alias</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    required={isRegistering}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-slate-500 text-xs font-sport focus:outline-none focus:border-[#EC4D25]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-sport text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-slate-500 text-xs font-sport focus:outline-none focus:border-[#EC4D25]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-sport text-slate-400 uppercase tracking-wider">Contraseña</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-slate-500 text-xs font-sport focus:outline-none focus:border-[#EC4D25]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#EC4D25] hover:bg-[#d63f19] text-white font-sport font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              <span>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMessage(null);
                }}
                className="text-xs font-sport text-slate-400 hover:text-white transition-colors"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Aún no tienes cuenta? Regístrate aquí'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center space-x-1.5 text-[10px] font-sport text-slate-400 uppercase tracking-widest">
          <Shield className="w-3 h-3 text-[#2BCFCE]" />
          <span>Simulador Gratuito • Sin Dinero Real</span>
        </div>
      </div>
    </div>
  );
}
