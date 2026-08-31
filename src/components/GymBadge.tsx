import React from 'react';
import { Dumbbell } from 'lucide-react';
import { Affiliation } from '../core/domain/types';
import Link from 'next/link';

interface GymBadgeProps {
  affiliation?: Affiliation;
  className?: string;
}

export function GymBadge({ affiliation, className = '' }: GymBadgeProps) {
  if (!affiliation) {
    return (
      <span className={`inline-flex items-center space-x-1 text-[11px] font-sport text-[#939599] ${className}`}>
        <span>Independiente</span>
      </span>
    );
  }

  return (
    <Link
      href={`/gyms/${affiliation.slug}`}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#EAECEF] hover:bg-[#CDCDCF] border border-[#CDCDCF] text-xs font-sport font-bold text-[#0E1015] uppercase tracking-wider transition-colors group ${className}`}
      title={`${affiliation.name} (${affiliation.city || ''}, ${affiliation.country || ''})`}
    >
      <Dumbbell className="w-3 h-3 text-[#EC4D25] group-hover:scale-110 transition-transform" />
      <span className="truncate max-w-[130px] sm:max-w-[180px]">
        {affiliation.name}
      </span>
    </Link>
  );
}

