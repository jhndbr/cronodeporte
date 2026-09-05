import { NextResponse } from 'next/server';
import { DataSyncService } from '@/modules/sync/data-sync.service';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scopeParam = searchParams.get('scope') || 'all';
    const force = searchParams.get('force') === 'true';

    const validScopes = ['all', 'events', 'news', 'calendar', 'rankings'] as const;
    const scope = validScopes.includes(scopeParam as typeof validScopes[number])
      ? (scopeParam as typeof validScopes[number])
      : 'all';

    const syncService = DataSyncService.getInstance();
    const result = await syncService.syncAll({ force, scope });

    return NextResponse.json({
      success: result.success,
      message: result.isFresh
        ? `Sincronización completada desde la API externa para scope: ${scope}`
        : `Los datos aún están vigentes (< 48-72h). Se sirvieron desde el almacenamiento persistente. Usa ?force=true para forzar actualización.`,
      syncedAt: result.syncedAt,
      nextSyncDue: result.nextSyncDue,
      source: result.source,
      details: {
        eventsCount: result.eventsCount,
        calendarCount: result.calendarCount,
        newsCount: result.newsCount,
        rankingsCount: result.rankingsCount,
      },
      error: result.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error durante la sincronización',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
