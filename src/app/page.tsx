import React from 'react';
import { EventService } from '@/services/event.service';
import { RankingsService } from '@/modules/rankings/rankings.service';
import { EventsService } from '@/modules/events/events.service';
import { Navbar } from '@/components/Navbar';
import { UfcEventShowcase } from '@/components/UfcEventShowcase';
import { UfcRankingsView } from '@/components/UfcRankingsView';
import { UfcNewsView } from '@/components/UfcNewsView';
import { GymsList } from '@/components/GymsList';
import { EventsCalendar } from '@/components/EventsCalendar';

// Revalidación inteligente a nivel de página (60s)
export const revalidate = 60;

export default async function HomePage() {
  const eventService = EventService.getInstance();
  const rankingsService = RankingsService.getInstance();
  const eventsService = EventsService.getInstance();

  // Consultas concurrentes protegidas por SmartCache (0 llamadas repetidas a la API externa)
  const [featuredEvent, rankingsResponse, news, calendar, discoveredGyms, allEvents] = await Promise.all([
    eventsService.getFeaturedEvent(),
    rankingsService.getRankings(),
    eventService.getUfcNews(8),
    eventService.getUfcCalendar(),
    eventService.getDiscoveredGyms(),
    eventService.getUpcomingEvents({ org: 'ufc' }),
  ]);

  const rankings = rankingsResponse.categories;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1E24] flex flex-col selection:bg-[#EC4D25] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* 1. Event Showcase (Carrusel de Selección -> Hero Banner -> Careo 3D -> Cartelera con Auto-rotación) */}
        {allEvents.length > 0 ? (
          <UfcEventShowcase
            events={allEvents}
            initialEventId={featuredEvent?.id || allEvents[0]?.id}
          />
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#CDCDCF] text-[#939599] font-sport font-bold">
            No se encontraron eventos activos en este momento.
          </div>
        )}

        {/* 4. Rankings Oficiales UFC Actualizados (P4P y Divisiones) */}
        {rankings.length > 0 && (
          <UfcRankingsView rankings={rankings} />
        )}

        {/* 5. Noticias UFC & MMA */}
        {news.length > 0 && (
          <UfcNewsView news={news} />
        )}

        {/* 6. Calendario de Eventos UFC */}
        <EventsCalendar events={allEvents} calendarItems={calendar} />

        {/* 7. Gimnasios & Training Camps */}
        {discoveredGyms.length > 0 && (
          <GymsList gyms={discoveredGyms} />
        )}
      </main>

      {/* Clean Sports Footer */}
      <footer className="border-t border-[#CDCDCF] bg-[#0E1015] py-8 text-xs font-sport text-[#939599] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black text-white font-display uppercase tracking-wider">
              CRONO<span className="text-[#EC4D25]">PORTE</span>
            </span>
            <span className="text-[#939599]">© {new Date().getFullYear()} • Carteleras, Resultados & Rankings Oficiales UFC</span>
          </div>

          <div className="flex items-center space-x-2 uppercase tracking-widest text-[#CDCDCF] text-[11px]">
            <span className="text-[#2BCFCE] font-bold">SmartCache SWR</span>
            <span>•</span>
            <span className="text-[#E5A93C] font-bold">UFC Official Data</span>
            <span>•</span>
            <span className="text-[#EC4D25] font-bold">Next.js 15</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
