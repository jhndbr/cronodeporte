import { NextResponse } from 'next/server';
import { UserService } from '@/modules/users/user.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, email, avatarUrl, provider, userId } = body;
    const userService = UserService.getInstance();

    if (action === 'login' || action === 'google_login') {
      const user = await userService.getOrCreateUser({
        name: name || 'Aficionado UFC',
        email: email,
        avatarUrl: avatarUrl,
        provider: provider || (action === 'google_login' ? 'google' : 'guest'),
      });

      return NextResponse.json({ success: true, data: user });
    }

    if (action === 'get_user' && userId) {
      const user = await userService.getUser(userId);
      return NextResponse.json({ success: true, data: user });
    }

    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error en autenticación' },
      { status: 500 }
    );
  }
}
