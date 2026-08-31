'use client';

import React from 'react';
import { Newspaper, ExternalLink, Calendar, Flame, Clock } from 'lucide-react';
import { UfcNewsArticle } from '../core/domain/types';

interface UfcNewsViewProps {
  news: UfcNewsArticle[];
}

export function UfcNewsView({ news }: UfcNewsViewProps) {
  if (!news || news.length === 0) return null;

  return (
    <section id="noticias" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#CDCDCF] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#EC4D25] text-white shadow-md shadow-[#EC4D25]/30 sports-skew">
            <Newspaper className="w-6 h-6 sports-unskew" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0E1015] uppercase tracking-tight font-display">
                ÚLTIMAS NOTICIAS UFC & MMA
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#2BCFCE] text-[#0E1015] font-sport font-black text-xs uppercase tracking-wider sports-skew">
                <span className="sports-unskew">TIEMPO REAL</span>
              </span>
            </div>
            <p className="text-xs font-sport font-bold text-[#939599] uppercase tracking-widest block -mt-1">
              Cobertura oficial ESPN • Resultados, anuncios de peleas y campamentos de entrenamiento
            </p>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item) => {
          const pubDate = new Date(item.publishedAt);
          const formattedDate = pubDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
          });

          return (
            <a
              key={item.id}
              href={item.sourceUrl || 'https://www.espn.com/mma/'}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-white rounded-2xl border-2 border-[#CDCDCF] hover:border-[#EC4D25] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200"
            >
              {/* Thumbnail image with category badge */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#0E1015]">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80'}
                  alt={item.headline}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter contrast-105"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-[#0E1015]/90 text-[#2BCFCE] font-sport font-black text-[10px] uppercase tracking-wider border border-[#2BCFCE]/40 sports-skew">
                  <span className="sports-unskew">{item.category || 'UFC'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] font-sport font-bold text-[#939599] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#EC4D25]" />
                    <span>{formattedDate}</span>
                  </div>

                  <h3 className="text-base font-black text-[#0E1015] group-hover:text-[#EC4D25] transition-colors line-clamp-2 font-display uppercase tracking-wide leading-tight">
                    {item.headline}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-[#939599] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#EAECEF] flex items-center justify-between text-xs font-sport font-black text-[#EC4D25] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                  <span>Leer Artículo en ESPN</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
