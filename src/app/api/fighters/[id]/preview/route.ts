import { NextResponse } from 'next/server';
import { FighterPreviewService } from '@/modules/ai/fighter-preview.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'current';
    const eventName = searchParams.get('eventName') || undefined;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Fighter ID requerido' }, { status: 400 });
    }

    const service = FighterPreviewService.getInstance();
    const preview = await service.getOrGeneratePreview({
      fighterId: id,
      eventId,
      eventName,
    });

    return NextResponse.json({ success: true, data: preview });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error generando análisis IA' },
      { status: 500 }
    );
  }
}
