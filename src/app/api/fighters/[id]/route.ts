import { NextResponse } from 'next/server';
import { FighterService } from '@/modules/fighters/fighter.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Fighter ID requerido' }, { status: 400 });
    }

    const fighterService = FighterService.getInstance();
    const profile = await fighterService.getFighterProfile(id);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Peleador no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: profile,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo historial del peleador',
      },
      { status: 500 }
    );
  }
}
