import { NextResponse } from 'next/server';
import { PredictionService } from '@/modules/predictions/prediction.service';
import { UserService } from '@/modules/users/user.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requerido' }, { status: 400 });
    }

    const predService = PredictionService.getInstance();
    const tickets = await predService.getUserTickets(userId);
    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error obteniendo tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, picks } = body;

    if (!userId || !picks || !Array.isArray(picks) || picks.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos de predicción incompletos' }, { status: 400 });
    }

    const predService = PredictionService.getInstance();
    const ticket = await predService.createTicket({
      userId,
      type: type || (picks.length > 1 ? 'COMBO' : 'SINGLE'),
      picks,
    });

    const userService = UserService.getInstance();
    const updatedUser = await userService.getUser(userId);

    return NextResponse.json({ success: true, data: ticket, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error creando boleto' },
      { status: 500 }
    );
  }
}
