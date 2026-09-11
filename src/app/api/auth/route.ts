import { NextResponse } from 'next/server';
import { getAuthService, getCurrentUserFromRequest } from '@/modules/auth/auth.helper';
import { UserService } from '@/modules/users/user.service';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, data: null }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error verificando sesión' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, email, password, avatarUrl, userId } = body;
    const authService = getAuthService();
    const userService = UserService.getInstance();

    // 1. Registro con Credenciales (Email + Password)
    if (action === 'register') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email y contraseña requeridos.' },
          { status: 400 }
        );
      }
      const result = await authService.register({
        email,
        password,
        name: name || 'Aficionado UFC',
        avatarUrl,
      });

      const response = NextResponse.json({
        success: true,
        data: result.user,
        token: result.token,
      });

      response.cookies.set('crono_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 días
      });

      return response;
    }

    // 2. Inicio de Sesión con Email y Contraseña
    if (action === 'login' && password && email) {
      const result = await authService.login({ email, password });

      const response = NextResponse.json({
        success: true,
        data: result.user,
        token: result.token,
      });

      response.cookies.set('crono_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // 3. Acceso Rápido / Modo Invitado
    if (action === 'guest' || (action === 'login' && !password)) {
      const result = await authService.guestLogin(name);

      const response = NextResponse.json({
        success: true,
        data: result.user,
        token: result.token,
      });

      response.cookies.set('crono_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // 4. Google Login
    if (action === 'google_login') {
      const result = await authService.googleLogin({
        name: name || 'Aficionado UFC',
        email,
        avatarUrl,
      });

      const response = NextResponse.json({
        success: true,
        data: result.user,
        token: result.token,
      });

      response.cookies.set('crono_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // 5. Consulta de Usuario por ID (compatibilidad)
    if (action === 'get_user' && userId) {
      const user = await userService.getUser(userId);
      return NextResponse.json({ success: true, data: user });
    }

    // 6. Cerrar Sesión
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente.' });
      response.cookies.delete('crono_session');
      return response;
    }

    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error en autenticación' },
      { status: 400 }
    );
  }
}
