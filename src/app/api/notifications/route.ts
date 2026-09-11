import { NextResponse } from 'next/server';
import { NotificationService } from '@/modules/notifications/notification.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const service = NotificationService.getInstance();
    const notifications = await service.getNotifications(userId);
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error obteniendo notificaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, userId } = body;
    const service = NotificationService.getInstance();

    if (action === 'mark_read' && id) {
      await service.markAsRead(id);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await service.markAllAsRead(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error actualizando notificaciones' },
      { status: 500 }
    );
  }
}
