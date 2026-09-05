'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Search, Sparkles } from 'lucide-react';
import { Event, UfcCalendarItem } from '../core/domain/types';

interface EventsCalendarProps {
  events: Event[];
  calendarItems?: UfcCalendarItem[];
}

export function EventsCalendar({ events, calendarItems = [] }: EventsCalendarProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'PPV' | 'FIGHT_NIGHT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const now = new Date();
  // Margen de 12 horas para permitir eventos de la noche actual
  const minTimestamp = now.getTime() - 12 * 3600 * 1000;

  const rawItems: UfcCalendarItem[] = calendarItems.length > 0
    ? calendarItems
    : events.map((e, idx) => ({
        id: e.id || `ev-${idx}`,
        label: e.name,
        startDate: e.startDate,
        isPPV: /UFC\s+\d+/i.test(e.name),
        isFightNight: /Fight Night/i.test(e.name),
        isContenderSeries: /Contender/i.test(e.name),
        location: `${e.venueName || 'Arena'}, ${e.city || 'Las Vegas'}`,
      }));

  // Filtrar solo eventos futuros y ordenar ascendente
  const futureItems = rawItems
    .filter((item) => {
      const itemTime = new Date(item.startDate).getTime();
      return !isNaN(itemTime) && itemTime >= minTimestamp;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const filteredItems = futureItems.filter((item) => {
    if (filterType === 'PPV' && !item.isPPV) return false;
    if (filterType === 'FIGHT_NIGHT' && !item.isFightNight) return false;
    if (searchTerm) {
      return (
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <section id="calendar" className="space-y-5 pt-2">
      {/* Section Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CDCDCF] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#0E1015] text-[#2BCFCE]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                Próximos Eventos UFC
              </h2>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-sport font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Próximas Fechas</span>
              </span>
            </div>
            <p className="text-xs font-sport text-[#939599] uppercase tracking-wider">
              {filteredItems.length} eventos programados a partir de hoy
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#939599]" />
            <input
              type="text"
              placeholder="Buscar evento o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#CDCDCF] text-xs font-sport text-[#0E1015] placeholder:text-[#939599] focus:outline-none focus:border-[#EC4D25] w-40 sm:w-48 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#F2F3F5] p-1 rounded-lg border border-[#CDCDCF]">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-colors ${
                filterType === 'ALL'
                  ? 'bg-[#0E1015] text-white'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              Todos ({futureItems.length})
            </button>
            <button
              onClick={() => setFilterType('PPV')}
              className={`px-2.5 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-colors ${
                filterType === 'PPV'
                  ? 'bg-[#EC4D25] text-white'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              PPV ({futureItems.filter((i) => i.isPPV).length})
            </button>
            <button
              onClick={() => setFilterType('FIGHT_NIGHT')}
              className={`px-2.5 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-colors ${
                filterType === 'FIGHT_NIGHT'
                  ? 'bg-[#2BCFCE] text-[#0E1015]'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              Fight Night ({futureItems.filter((i) => i.isFightNight).length})
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#CDCDCF] text-[#939599] font-sport text-sm">
          No hay eventos futuros programados que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.slice(0, 18).map((item) => {
            const eventDate = new Date(item.startDate);
            const formattedDate = eventDate.toLocaleDateString('es-ES', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-colors duration-200 flex flex-col justify-between space-y-3 ${
                  item.isPPV
                    ? 'bg-white border-[#EC4D25]/40 hover:border-[#EC4D25]/70'
                    : 'bg-white border-[#CDCDCF] hover:border-[#939599]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded font-sport font-black text-[11px] uppercase tracking-wider ${
                        item.isPPV
                          ? 'bg-[#EC4D25] text-white'
                          : item.isFightNight
                          ? 'bg-[#2BCFCE] text-[#0E1015]'
                          : 'bg-[#939599] text-white'
                      }`}
                    >
                      {item.isPPV ? 'UFC PPV' : item.isFightNight ? 'FIGHT NIGHT' : 'EVENT'}
                    </span>

                    <span className="text-xs font-sport text-[#939599] font-semibold flex items-center space-x-1 uppercase">
                      <Calendar className="w-3 h-3 text-[#939599]" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#0E1015] mt-2.5 font-display uppercase tracking-wide leading-snug">
                    {item.label}
                  </h3>
                </div>

                <div className="pt-2.5 border-t border-[#EAECEF] flex items-center justify-between text-xs font-sport text-[#939599]">
                  <div className="flex items-center space-x-1.5 truncate">
                    <MapPin className="w-3 h-3 text-[#939599] shrink-0" />
                    <span className="truncate">{item.location || 'Las Vegas, NV'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
