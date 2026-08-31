'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Trophy, Flame, ChevronRight, Search, Shield } from 'lucide-react';
import { Event, UfcCalendarItem } from '../core/domain/types';

interface EventsCalendarProps {
  events: Event[];
  calendarItems?: UfcCalendarItem[];
}

export function EventsCalendar({ events, calendarItems = [] }: EventsCalendarProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'PPV' | 'FIGHT_NIGHT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Use calendarItems if available, or fallback to mapped events
  const allItems: UfcCalendarItem[] = calendarItems.length > 0
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

  const filteredItems = allItems.filter((item) => {
    if (filterType === 'PPV' && !item.isPPV) return false;
    if (filterType === 'FIGHT_NIGHT' && !item.isFightNight) return false;
    if (searchTerm) {
      return item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return true;
  });

  return (
    <section id="calendar" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#CDCDCF] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#0E1015] text-[#2BCFCE] shadow-md sports-skew">
            <Calendar className="w-6 h-6 sports-unskew" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                CALENDARIO ANUAL UFC
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider sports-skew">
                <span className="sports-unskew">TEMPORADA COMPLETA</span>
              </span>
            </div>
            <p className="text-xs font-sport font-bold text-[#939599] uppercase tracking-widest block -mt-1">
              Todos los eventos oficiales programados por ESPN & UFC • {allItems.length} Carteleras
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
              placeholder="Buscar peleador o evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#CDCDCF] text-xs font-sport text-[#0E1015] placeholder:text-[#939599] focus:outline-none focus:border-[#EC4D25] w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#EAECEF] p-1 rounded-lg border border-[#CDCDCF]">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                filterType === 'ALL'
                  ? 'bg-[#0E1015] text-white shadow-sm'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              TODOS
            </button>
            <button
              onClick={() => setFilterType('PPV')}
              className={`px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                filterType === 'PPV'
                  ? 'bg-[#EC4D25] text-white shadow-sm'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              PPV NUMERADOS
            </button>
            <button
              onClick={() => setFilterType('FIGHT_NIGHT')}
              className={`px-3 py-1 rounded font-sport font-bold text-xs uppercase tracking-wider transition-all ${
                filterType === 'FIGHT_NIGHT'
                  ? 'bg-[#2BCFCE] text-[#0E1015] shadow-sm'
                  : 'text-[#939599] hover:text-[#0E1015]'
              }`}
            >
              FIGHT NIGHTS
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm ${
                item.isPPV
                  ? 'bg-white border-[#EC4D25] hover:shadow-md'
                  : 'bg-white border-[#CDCDCF] hover:border-[#2BCFCE]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded font-sport font-black text-xs uppercase tracking-wider sports-skew ${
                      item.isPPV
                        ? 'bg-[#EC4D25] text-white'
                        : item.isFightNight
                        ? 'bg-[#2BCFCE] text-[#0E1015]'
                        : 'bg-[#939599] text-white'
                    }`}
                  >
                    <span className="sports-unskew">
                      {item.isPPV ? 'UFC PPV' : item.isFightNight ? 'FIGHT NIGHT' : 'UFC EVENT'}
                    </span>
                  </span>

                  <span className="text-xs font-sport text-[#939599] font-bold flex items-center space-x-1 uppercase">
                    <Calendar className="w-3.5 h-3.5 text-[#EC4D25]" />
                    <span>{formattedDate}</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#0E1015] mt-3 font-display uppercase tracking-wide leading-tight">
                  {item.label}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#EAECEF] flex items-center justify-between text-xs font-sport text-[#939599]">
                <div className="flex items-center space-x-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#EC4D25] shrink-0" />
                  <span className="truncate">{item.location || 'Las Vegas, NV'}</span>
                </div>

                <span className="shrink-0 text-[#2BCFCE] font-black uppercase text-[11px]">
                  ESPN + UFC
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
