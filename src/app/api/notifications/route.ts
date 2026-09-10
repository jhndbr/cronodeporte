import { NextResponse } from 'next/server';
import { NotificationService } from '@/modules/notifications/notification.service';

export async function GET() {
  try {
    const service = NotificationService.getInstance();
    const notifications = await service.getNotifications();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error obteniendo notificaciones' },
      { status: 500 }
    );
  }
}
