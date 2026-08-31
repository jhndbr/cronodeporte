import React from 'react';
import { Dumbbell, MapPin, User, ArrowUpRight } from 'lucide-react';
import { Affiliation } from '../core/domain/types';
import Link from 'next/link';

interface GymsListProps {
  gyms: Affiliation[];
}

export function GymsList({ gyms }: GymsListProps) {
  return (
    <section id="gyms" className="space-y-6 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#CDCDCF] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#0E1015] text-[#2BCFCE] shadow-md sports-skew">
            <Dumbbell className="w-6 h-6 sports-unskew" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                GYMS & TRAINING CAMPS
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#EC4D25] text-white font-sport font-black text-xs uppercase tracking-wider sports-skew">
                <span className="sports-unskew">ALTO RENDIMIENTO</span>
              </span>
            </div>
            <p className="text-xs font-sport font-bold text-[#939599] uppercase tracking-widest block -mt-1">
              Academias, dojos y centros de combate representados en las carteleras oficiales
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gyms.map((gym) => (
          <Link
            key={gym.id}
            href={`/gyms/${gym.slug}`}
            className="group relative p-5 rounded-2xl bg-white border-2 border-[#CDCDCF] hover:border-[#EC4D25] transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EAECEF] flex items-center justify-center border border-[#CDCDCF] group-hover:bg-[#EC4D25] group-hover:text-white transition-colors">
                  <Dumbbell className="w-5 h-5 text-[#EC4D25] group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#939599] group-hover:text-[#EC4D25] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <h3 className="text-lg font-black text-[#0E1015] mt-3 group-hover:text-[#EC4D25] transition-colors font-display uppercase tracking-wide">
                {gym.name}
              </h3>

              {gym.description && (
                <p className="text-xs text-[#939599] mt-1 line-clamp-2 leading-relaxed">
                  {gym.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#EAECEF] space-y-1.5 text-xs font-sport text-[#939599] uppercase tracking-wider">
              {(gym.city || gym.country) && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#EC4D25]" />
                  <span>{[gym.city, gym.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {gym.headCoach && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-[#2BCFCE]" />
                  <span>Head Coach: <strong className="text-[#0E1015] font-black">{gym.headCoach}</strong></span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

