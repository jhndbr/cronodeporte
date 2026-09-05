import { NextResponse } from 'next/server';
import { RankingsService } from '@/modules/rankings/rankings.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender') as 'MALE' | 'FEMALE' | undefined;
    const p4pOnly = searchParams.get('p4p') === 'true';
    const slug = searchParams.get('slug') || undefined;

    const rankingsService = RankingsService.getInstance();
    const result = await rankingsService.getRankings({
      gender,
      p4pOnly,
      slug,
    });

    return NextResponse.json({
      success: true,
      data: result.categories,
      count: result.categories.length,
      lastUpdated: result.lastUpdated,
      source: result.source,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener los rankings oficiales',
      },
      { status: 500 }
    );
  }
}
