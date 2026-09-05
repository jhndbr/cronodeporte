'use client';

import React, { useState } from 'react';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { UfcNewsArticle } from '../core/domain/types';

interface UfcNewsViewProps {
  news: UfcNewsArticle[];
}

export function UfcNewsView({ news }: UfcNewsViewProps) {
  if (!news || news.length === 0) return null;

  return (
    <section id="noticias" className="space-y-5 pt-2">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CDCDCF] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#EC4D25] text-white">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0E1015] uppercase tracking-tight font-display">
              Noticias UFC
            </h2>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function NewsCard({ item }: { item: UfcNewsArticle }) {
  const [imgError, setImgError] = useState(false);

  const pubDate = new Date(item.publishedAt);
  const formattedDate = pubDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });

  const fallbackImage = 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80';

  return (
    <a
      href={item.sourceUrl || 'https://www.espn.com/mma/'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-xl border border-[#CDCDCF] hover:border-[#939599] overflow-hidden transition-colors duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0E1015]">
        <img
          src={!imgError && item.imageUrl ? item.imageUrl : fallbackImage}
          alt={item.headline}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[#2BCFCE] font-sport font-black text-[10px] uppercase tracking-wider">
          <span>{item.category || 'UFC'}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-sport font-semibold text-[#939599] uppercase">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-[#0E1015] group-hover:text-[#EC4D25] transition-colors line-clamp-2 font-display uppercase tracking-wide leading-tight">
            {item.headline}
          </h3>

          {item.description && (
            <p className="text-xs text-[#939599] line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-[#EAECEF] flex items-center justify-between text-xs font-sport font-bold text-[#EC4D25] uppercase tracking-wider">
          <span>Leer en ESPN</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </a>
  );
}
