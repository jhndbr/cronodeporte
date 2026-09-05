import React from 'react';
import { Dumbbell, MapPin, User, ArrowUpRight } from 'lucide-react';
import { Affiliation } from '../core/domain/types';
import Link from 'next/link';

interface GymsListProps {
  gyms: Affiliation[];
}

export function GymsList({ gyms }: GymsListProps) {
  return (
    <section id="gyms" className="space-y-5 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CDCDCF] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#0E1015] text-[#2BCFCE] shadow-sm sports-skew">
            <Dumbbell className="w-5 h-5 sports-unskew" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
              Gimnasios & Training Camps
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {gyms.map((gym) => (
          <Link
            key={gym.id}
            href={`/gyms/${gym.slug}`}
            className="group relative p-4 rounded-2xl bg-white border border-[#CDCDCF] hover:border-[#EC4D25] transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#EAECEF] flex items-center justify-center border border-[#CDCDCF] group-hover:bg-[#EC4D25] group-hover:text-white transition-colors">
                  <Dumbbell className="w-4 h-4 text-[#EC4D25] group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#939599] group-hover:text-[#EC4D25] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <h3 className="text-base font-black text-[#0E1015] mt-2.5 group-hover:text-[#EC4D25] transition-colors font-display uppercase tracking-wide">
                {gym.name}
              </h3>

              {gym.description && (
                <p className="text-xs text-[#939599] mt-1 line-clamp-2 leading-relaxed">
                  {gym.description}
                </p>
              )}
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-[#EAECEF] space-y-1 text-xs font-sport text-[#939599] uppercase">
              {(gym.city || gym.country) && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3 h-3 text-[#EC4D25]" />
                  <span>{[gym.city, gym.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {gym.headCoach && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-3 h-3 text-[#2BCFCE]" />
                  <span>Coach: <strong className="text-[#0E1015] font-black">{gym.headCoach}</strong></span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
