import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from './auth.service';
import { InMemoryUserRepository } from '@/infra/repositories/in-memory/in-memory-user.repository';
import { BcryptHasherService } from '@/infra/security/bcrypt-hasher.service';
import { JwtTokenService } from '@/infra/security/jwt-token.service';

describe('AuthService (Modulo de Autenticación Desacoplado)', () => {
  let userRepo: InMemoryUserRepository;
  let hasher: BcryptHasherService;
  let tokenService: JwtTokenService;
  let authService: AuthService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    hasher = new BcryptHasherService(4); // Salt rounds reducidos para velocidad en tests
    tokenService = new JwtTokenService('test_secret_key_at_least_32_characters_long!');
    authService = new AuthService(userRepo, hasher, tokenService);
  });

  test('Debe registrar un nuevo usuario con contraseña hasheada y retornar token', async () => {
    const result = await authService.register({
      email: 'alex.poatan@ufc.com',
      password: 'chamaPassword123',
      name: 'Alex Pereira',
    });

    assert.ok(result.user.id);
    assert.equal(result.user.email, 'alex.poatan@ufc.com');
    assert.equal(result.user.name, 'Alex Pereira');
    assert.equal(result.user.provider, 'credentials');
    assert.ok(result.token);

    // Verificar en persistencia que la contraseña está hasheada
    const persisted = await userRepo.findByEmail('alex.poatan@ufc.com');
    assert.ok(persisted?.passwordHash);
    assert.notEqual(persisted?.passwordHash, 'chamaPassword123');
  });

  test('Debe rechazar registro con contraseña menor a 6 caracteres', async () => {
    await assert.rejects(
      async () => {
        await authService.register({
          email: 'short@ufc.com',
          password: '123',
          name: 'Test Short',
        });
      },
      { message: 'La contraseña debe tener al menos 6 caracteres.' }
    );
  });

  test('Debe rechazar registro con email duplicado', async () => {
    await authService.register({
      email: 'islam@ufc.com',
      password: 'password123',
      name: 'Islam Makhachev',
    });

    await assert.rejects(
      async () => {
        await authService.register({
          email: 'ISLAM@ufc.com', // case insensitive
          password: 'anotherPassword',
          name: 'Islam Duplicate',
        });
      },
      { message: 'El correo electrónico ya está registrado.' }
    );
  });

  test('Debe autenticar credenciales correctas', async () => {
    await authService.register({
      email: 'topuria@ufc.com',
      password: 'elMatadorPassword',
      name: 'Ilia Topuria',
    });

    const loginResult = await authService.login({
      email: 'topuria@ufc.com',
      password: 'elMatadorPassword',
    });

    assert.ok(loginResult.token);
    assert.equal(loginResult.user.name, 'Ilia Topuria');
  });

  test('Debe rechazar contraseña errónea', async () => {
    await authService.register({
      email: 'volk@ufc.com',
      password: 'theGreatPassword',
      name: 'Alexander Volkanovski',
    });

    await assert.rejects(
      async () => {
        await authService.login({
          email: 'volk@ufc.com',
          password: 'wrongPassword',
        });
      },
      { message: 'Credenciales inválidas.' }
    );
  });

  test('Debe permitir acceso como invitado sin contraseña', async () => {
    const guest = await authService.guestLogin('FanaticoUFC');

    assert.ok(guest.user.id.startsWith('usr-guest-'));
    assert.equal(guest.user.name, 'FanaticoUFC');
    assert.equal(guest.user.provider, 'guest');
    assert.ok(guest.token);
  });

  test('Debe verificar una sesión válida mediante token JWT', async () => {
    const reg = await authService.register({
      email: 'max@ufc.com',
      password: 'blessedPassword',
      name: 'Max Holloway',
    });

    const sessionUser = await authService.verifySession(reg.token);
    assert.ok(sessionUser);
    assert.equal(sessionUser?.email, 'max@ufc.com');
  });

  test('Debe devolver null para token inválido o manipulado', async () => {
    const fakeToken = 'invalid.jwt.token';
    const session = await authService.verifySession(fakeToken);
    assert.equal(session, null);
  });
});
