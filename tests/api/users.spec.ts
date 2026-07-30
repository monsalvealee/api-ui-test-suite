import { test, expect } from '@playwright/test';
import { esEmailValido, idsDuplicados } from '../../src/validators';
import type { User, Post } from '../../src/validators';

/**
 * Tests de API sobre /users, incluyendo integridad referencial entre
 * recursos relacionados — el tipo de bug que un test de un solo endpoint
 * nunca encuentra.
 */

test.describe('API /users', () => {
  test('GET /users devuelve usuarios con email válido', async ({ request }) => {
    const respuesta = await request.get('/users');

    expect(respuesta.status()).toBe(200);

    const usuarios: User[] = await respuesta.json();
    expect(usuarios.length).toBeGreaterThan(0);

    for (const usuario of usuarios) {
      expect(usuario.name).toBeTruthy();
      expect(usuario.username).toBeTruthy();
      expect(esEmailValido(usuario.email)).toBe(true);
    }

    expect(idsDuplicados(usuarios)).toEqual([]);
  });

  test('GET /users/:id devuelve el usuario correcto', async ({ request }) => {
    const respuesta = await request.get('/users/3');

    expect(respuesta.status()).toBe(200);

    const usuario: User = await respuesta.json();
    expect(usuario.id).toBe(3);
    expect(esEmailValido(usuario.email)).toBe(true);
  });

  test('integridad referencial: todo post pertenece a un usuario existente', async ({
    request,
  }) => {
    // Se traen los dos recursos y se cruzan. Un post huérfano —apuntando a un
    // userId que no existe— es un bug de datos que ningún test aislado detecta.
    const [respUsuarios, respPosts] = await Promise.all([
      request.get('/users'),
      request.get('/posts'),
    ]);

    const usuarios: User[] = await respUsuarios.json();
    const posts: Post[] = await respPosts.json();

    const idsExistentes = new Set(usuarios.map((u) => u.id));
    const huerfanos = posts.filter((p) => !idsExistentes.has(p.userId));

    expect(
      huerfanos,
      `Posts apuntando a usuarios inexistentes: ${huerfanos
        .map((p) => `post ${p.id} -> user ${p.userId}`)
        .join(', ')}`,
    ).toEqual([]);
  });

  test('GET /users/:id inexistente devuelve 404', async ({ request }) => {
    const respuesta = await request.get('/users/9999');
    expect(respuesta.status()).toBe(404);
  });
});
