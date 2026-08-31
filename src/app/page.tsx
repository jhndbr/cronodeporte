import React from 'react';
import { EventService } from '@/services/event.service';
import { Navbar } from '@/components/Navbar';
import { EventHero } from '@/components/EventHero';
import { FightCardView } from '@/components/FightCardView';
import { UfcCareoParallax } from '@/components/UfcCareoParallax';
import { UfcRankingsView } from '@/components/UfcRankingsView';
import { UfcNewsView } from '@/components/UfcNewsView';
import { GymsList } from '@/components/GymsList';
import { EventsCalendar } from '@/components/EventsCalendar';
import { Flame, Shield, Trophy, Activity, Zap, Radio, Globe } from 'lucide-react';

export const revalidate = 60; // Revalidar cada 60 segundos

export default async function HomePage() {
  const eventService = EventService.getInstance();
  
  // Extraer todos los recursos posibles de la API deportiva de UFC
  const [events, rankings, news, calendar, discoveredGyms] = await Promise.all([
    eventService.getUpcomingEvents({ org: 'ufc' }),
    eventService.getUfcRankings(),
    eventService.getUfcNews(8),
    eventService.getUfcCalendar(),
    eventService.getDiscoveredGyms(),
  ]);

  const featuredEvent = events[0] || null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1E24] flex flex-col selection:bg-[#EC4D25] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* 1. Featured Event Hero Banner */}
        {featuredEvent ? (
          <EventHero event={featuredEvent} />
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border-2 border-[#CDCDCF] text-[#939599] font-sport font-bold">
            No se encontraron eventos activos en este momento.
          </div>
        )}

        {/* 2. Fight Card (Cartelera Oficial con Filtros de Segmento) */}
        {featuredEvent && featuredEvent.matches.length > 0 && (
          <FightCardView matches={featuredEvent.matches} />
        )}

        {/* 3. Careo 3D con Efecto Parallax, Fondo de Rejas UFC, Selector de Peleadores y Momios */}
        {featuredEvent && featuredEvent.matches.length > 0 && (
          <UfcCareoParallax matches={featuredEvent.matches} />
        )}

        {/* 4. Rankings Oficiales UFC de la API (P4P y Divisiones de Peso) */}
        {rankings.length > 0 && (
          <UfcRankingsView rankings={rankings} />
        )}

        {/* 5. Noticias de UFC & MMA en Tiempo Real de ESPN */}
        {news.length > 0 && (
          <UfcNewsView news={news} />
        )}

        {/* 6. Calendario Anual de Eventos UFC (PPVs, Fight Nights) */}
        <EventsCalendar events={events} calendarItems={calendar} />

        {/* 7. Gimnasios y Training Camps de Alto Rendimiento */}
        {discoveredGyms.length > 0 && (
          <GymsList gyms={discoveredGyms} />
        )}

        {/* 8. Banner Arquitectura Multideporte */}
        <section id="sports" className="p-8 sm:p-10 rounded-3xl bg-[#0E1015] border-2 border-[#CDCDCF] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2BCFCE]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#EC4D25]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EC4D25]/20 border border-[#EC4D25]/40 text-[#EC4D25] text-xs font-sport font-black uppercase tracking-widest sports-skew">
                <Zap className="w-3.5 h-3.5 sports-unskew" />
                <span className="sports-unskew">ARQUITECTURA DEPORTIVA UNIFICADA</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
                DEPORTES DE COMBATE, INDIVIDUALES & EQUIPO
              </h3>
              <p className="text-xs sm:text-sm text-[#CDCDCF] max-w-2xl font-sport leading-relaxed">
                El sistema desacopla los adaptadores de datos para integrar cualquier liga mundial. Atletas, gimnasios, momios de apuestas, carteleras y rankings se sincronizan en tiempo real con la API deportiva oficial.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <span className="px-4 py-2 rounded-lg bg-[#EC4D25] text-xs font-sport font-black text-white flex items-center space-x-2 shadow-lg shadow-[#EC4D25]/20 sports-skew">
                <Flame className="w-4 h-4 sports-unskew" />
                <span className="sports-unskew">UFC / MMA</span>
              </span>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-xs font-sport font-bold text-[#CDCDCF] border border-white/10 flex items-center space-x-2 sports-skew">
                <Shield className="w-4 h-4 text-[#E5A93C] sports-unskew" />
                <span className="sports-unskew">BOXEO</span>
              </span>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-xs font-sport font-bold text-[#CDCDCF] border border-white/10 flex items-center space-x-2 sports-skew">
                <Trophy className="w-4 h-4 text-[#2BCFCE] sports-unskew" />
                <span className="sports-unskew">FÚTBOL</span>
              </span>
              <span className="px-4 py-2 rounded-lg bg-white/10 text-xs font-sport font-bold text-[#CDCDCF] border border-white/10 flex items-center space-x-2 sports-skew">
                <Activity className="w-4 h-4 text-[#CDCDCF] sports-unskew" />
                <span className="sports-unskew">BÁSQUETBOL</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Sports Footer */}
      <footer className="border-t-2 border-[#CDCDCF] bg-[#0E1015] py-10 text-xs font-sport text-[#939599] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black text-white font-display uppercase tracking-wider">
              CRONO<span className="text-[#EC4D25]">PORTE</span>
            </span>
            <span className="text-[#CDCDCF]">© {new Date().getFullYear()} • Centro Oficial de Eventos y Combates UFC</span>
          </div>

          <div className="flex items-center space-x-4 uppercase tracking-widest text-[#CDCDCF] text-[11px]">
            <span className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-[#2BCFCE] animate-pulse" />
              <span>ESPN Core & Site API v2/v3</span>
            </span>
            <span>•</span>
            <span className="text-[#EC4D25] font-black">Next.js 15 & TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

