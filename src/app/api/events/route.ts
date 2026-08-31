import { NextResponse } from 'next/server';
import { EventService } from '@/services/event.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || undefined;
  const org = searchParams.get('org') || undefined;

  try {
    const eventService = EventService.getInstance();
    const events = await eventService.getUpcomingEvents({ sport, org });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al consultar eventos',
      },
      { status: 500 }
    );
  }
}
