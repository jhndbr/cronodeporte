'use client';

import React, { useRef, useEffect } from 'react';
import { Flame, Trophy, Swords, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Match } from '@/core/domain/types';

interface CareoQuickNavProps {
  matches: Match[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onClose?: () => void;
}

export function CareoQuickNav({
  matches,
  selectedIndex,
  onSelectIndex,
  onClose,
}: CareoQuickNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mantener el botón seleccionado centrado en la vista horizontal
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const activeButton = container.children[selectedIndex] as HTMLElement | undefined;
    if (activeButton) {
      const offsetLeft = activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
      container.scrollTo({ left: offsetLeft, behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#0E1015]/90 backdrop-blur-md border-t border-white/10 px-4 py-3 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Etiqueta de Segmento actual y progreso */}
        <div className="hidden md:flex items-center space-x-2 shrink-0">
          <div className="p-1.5 rounded-lg bg-[#EC4D25] text-white">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-sport font-black uppercase text-[#CDCDCF] tracking-wider">
              Navegación Rápida
            </div>
            <div className="text-xs font-sport font-bold text-white uppercase">
              Pelea {selectedIndex + 1} de {matches.length}
            </div>
          </div>
        </div>

        {/* Flecha Izquierda */}
        <button
          onClick={handleScrollLeft}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Carrusel de Píldoras de Peleas */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none no-scrollbar scroll-smooth"
        >
          {matches.map((m, idx) => {
            const isSelected = selectedIndex === idx;
            const redLast = m.participants?.[0]?.participant?.displayName?.split(' ')?.pop() || 'P1';
            const blueLast = m.participants?.[1]?.participant?.displayName?.split(' ')?.pop() || 'P2';
            const isMain = m.isMainEvent;
            const isCoMain = m.isCoMain;

            return (
              <button
                key={m.id || idx}
                onClick={() => onSelectIndex(idx)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-sport text-xs font-bold uppercase whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? isMain
                      ? 'bg-[#EC4D25] text-white border-[#EC4D25] shadow-lg shadow-[#EC4D25]/40 scale-105 ring-2 ring-[#EC4D25]/50'
                      : isCoMain
                      ? 'bg-[#2BCFCE] text-[#0E1015] border-[#2BCFCE] shadow-lg shadow-[#2BCFCE]/30 scale-105 ring-2 ring-[#2BCFCE]/50'
                      : 'bg-white text-[#0E1015] border-white shadow-md scale-105'
                    : isMain
                    ? 'bg-black/50 text-[#EC4D25] border-[#EC4D25]/50 hover:bg-[#EC4D25]/20'
                    : isCoMain
                    ? 'bg-black/50 text-[#2BCFCE] border-[#2BCFCE]/50 hover:bg-[#2BCFCE]/20'
                    : 'bg-black/40 text-[#CDCDCF] border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isMain && <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />}
                {isCoMain && <Trophy className="w-3.5 h-3.5 text-[#2BCFCE]" />}
                <span>#{idx + 1}</span>
                <span className="font-display tracking-wide">{redLast} vs {blueLast}</span>
              </button>
            );
          })}
        </div>

        {/* Flecha Derecha */}
        <button
          onClick={handleScrollRight}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón Salir si se proporciona */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider transition-colors shrink-0"
            title="Salir de pantalla completa (ESC)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        )}
      </div>
    </div>
  );
}
