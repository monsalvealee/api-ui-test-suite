import { test, expect } from '@playwright/test';
import { validarPost, idsDuplicados, dentroDelSLA } from '../../src/validators';
import type { Post } from '../../src/validators';

/**
 * Tests de API sobre el recurso /posts.
 *
 * Cubren el ciclo CRUD completo, el contrato de la respuesta, los códigos de
 * error y el presupuesto de tiempo de respuesta.
 */

const SLA_MS = 2000; // presupuesto de respuesta acordado

test.describe('API /posts', () => {
  test('GET /posts devuelve una colección válida y sin ids repetidos', async ({
    request,
  }) => {
    const inicio = Date.now();
    const respuesta = await request.get('/posts');
    const duracion = Date.now() - inicio;

    expect(respuesta.status()).toBe(200);
    expect(respuesta.headers()['content-type']).toContain('application/json');
    expect(dentroDelSLA(duracion, SLA_MS)).toBe(true);

    const posts: Post[] = await respuesta.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);

    // Contrato: cada elemento tiene que cumplir la forma esperada.
    for (const post of posts) {
      expect(validarPost(post)).toEqual([]);
    }

    // Integridad: un listado nunca debería traer ids duplicados.
    expect(idsDuplicados(posts)).toEqual([]);
  });

  test('GET /posts/:id devuelve el recurso solicitado', async ({ request }) => {
    const respuesta = await request.get('/posts/1');

    expect(respuesta.status()).toBe(200);

    const post: Post = await respuesta.json();
    expect(post.id).toBe(1);
    expect(validarPost(post)).toEqual([]);
  });

  test('GET /posts/:id con un id inexistente devuelve 404', async ({
    request,
  }) => {
    const respuesta = await request.get('/posts/999999');
    expect(respuesta.status()).toBe(404);
  });

  test('POST /posts crea un recurso y devuelve 201', async ({ request }) => {
    const nuevo = {
      title: 'Post de prueba automatizada',
      body: 'Contenido generado por la suite de tests',
      userId: 1,
    };

    const respuesta = await request.post('/posts', { data: nuevo });

    expect(respuesta.status()).toBe(201);

    const creado = await respuesta.json();
    // El servidor debe devolver lo que le mandamos, más un id asignado.
    expect(creado).toMatchObject(nuevo);
    expect(typeof creado.id).toBe('number');
  });

  test('PUT /posts/:id actualiza el recurso completo', async ({ request }) => {
    const actualizado = {
      id: 1,
      title: 'Título actualizado',
      body: 'Cuerpo actualizado',
      userId: 1,
    };

    const respuesta = await request.put('/posts/1', { data: actualizado });

    expect(respuesta.status()).toBe(200);
    expect(await respuesta.json()).toMatchObject(actualizado);
  });

  test('PATCH /posts/:id modifica solo el campo enviado', async ({
    request,
  }) => {
    const respuesta = await request.patch('/posts/1', {
      data: { title: 'Solo cambia el título' },
    });

    expect(respuesta.status()).toBe(200);

    const post = await respuesta.json();
    expect(post.title).toBe('Solo cambia el título');
    // El resto de los campos tiene que seguir presente.
    expect(post.body).toBeTruthy();
    expect(post.userId).toBeDefined();
  });

  test('DELETE /posts/:id responde con éxito', async ({ request }) => {
    const respuesta = await request.delete('/posts/1');
    expect(respuesta.status()).toBe(200);
  });

  test('GET /posts admite filtrado por userId', async ({ request }) => {
    const respuesta = await request.get('/posts?userId=1');

    expect(respuesta.status()).toBe(200);

    const posts: Post[] = await respuesta.json();
    expect(posts.length).toBeGreaterThan(0);

    // Todos los resultados tienen que corresponder al filtro pedido.
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });
});
