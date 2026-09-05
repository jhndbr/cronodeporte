import React from 'react';
import { EventService } from '@/services/event.service';
import { Navbar } from '@/components/Navbar';
import { Dumbbell, MapPin, User, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FighterAvatar } from '@/components/FighterAvatar';

export default async function GymDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const eventService = EventService.getInstance();
  const gyms = await eventService.getDiscoveredGyms();
  const gym = gyms.find((g) => g.slug === slug || g.id === slug);

  if (!gym) {
    notFound();
  }

  const fighters = await eventService.getFightersByGym(slug);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1E24] flex flex-col selection:bg-[#EC4D25] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-sport font-bold uppercase tracking-wider text-[#939599] hover:text-[#EC4D25] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Gym Header Banner */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0E1015] border border-[#282E3E] shadow-2xl text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#2BCFCE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-[#EC4D25] flex items-center justify-center shadow-lg shadow-[#EC4D25]/30 sports-skew">
              <Dumbbell className="w-8 h-8 text-white sports-unskew" />
            </div>

            <div className="space-y-1 flex-1">
              <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-sport font-black text-[#2BCFCE] uppercase tracking-wider">
                {gym.type.replace('_', ' ')}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-wide">
                {gym.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-sport text-[#CDCDCF] pt-0.5">
                {(gym.city || gym.country) && (
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EC4D25]" />
                    <span>{[gym.city, gym.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {gym.headCoach && (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-[#2BCFCE]" />
                    <span>Coach: <strong className="text-white font-black">{gym.headCoach}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {gym.description && (
            <p className="mt-5 text-xs sm:text-sm text-[#CDCDCF] max-w-3xl leading-relaxed border-t border-white/10 pt-3 font-sport">
              {gym.description}
            </p>
          )}
        </div>

        {/* Fighters Section */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 border-b border-[#CDCDCF] pb-2.5">
            <Shield className="w-4 h-4 text-[#EC4D25]" />
            <h2 className="text-xl font-black text-[#0E1015] font-display uppercase tracking-wide">
              Peleadores Afiliados ({fighters.length})
            </h2>
          </div>

          {fighters.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#CDCDCF] text-[#939599] font-sport text-sm font-bold">
              No hay peleadores registrados en las carteleras de esta semana para este campamento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {fighters.map((fighter) => {
                const fStats = fighter.stats as import('@/core/domain/types').FighterStats;
                return (
                  <div
                    key={fighter.id}
                    className="p-4 rounded-2xl bg-white border border-[#CDCDCF] hover:border-[#EC4D25] transition-all flex items-center space-x-3.5 shadow-sm"
                  >
                    <FighterAvatar
                      src={fighter.avatarUrl}
                      name={fighter.displayName}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-[#0E1015] font-display uppercase tracking-wide truncate">
                        {fighter.displayName}
                      </h3>
                      {fighter.nickname && (
                        <p className="text-xs text-[#EC4D25] font-sport font-semibold truncate italic">
                          "{fighter.nickname}"
                        </p>
                      )}
                      <p className="text-xs font-sport text-[#939599] font-bold mt-0.5">
                        Récord: <span className="text-[#0E1015]">{fStats?.wins ?? 0}-{fStats?.losses ?? 0}-{fStats?.draws ?? 0}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
