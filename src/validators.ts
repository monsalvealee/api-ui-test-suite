/**
 * Funciones puras de validación.
 *
 * Están separadas de los tests a propósito: son lógica reutilizable, no
 * aserciones. Al no depender de red ni de navegador, se pueden testear con
 * Jest de forma instantánea — que es exactamente el motivo por el que este
 * proyecto usa dos runners distintos.
 */

/** Forma esperada de un post devuelto por la API. */
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** Forma esperada de un usuario. */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

/**
 * Verifica que un objeto cumpla el contrato de Post.
 * Devuelve la lista de problemas encontrados: vacía significa válido.
 */
export function validarPost(dato: unknown): string[] {
  const errores: string[] = [];

  if (typeof dato !== 'object' || dato === null) {
    return ['El dato no es un objeto'];
  }

  const p = dato as Record<string, unknown>;

  if (typeof p.id !== 'number' || p.id <= 0) {
    errores.push('id debe ser un número positivo');
  }
  if (typeof p.userId !== 'number' || p.userId <= 0) {
    errores.push('userId debe ser un número positivo');
  }
  if (typeof p.title !== 'string' || p.title.trim() === '') {
    errores.push('title no puede estar vacío');
  }
  if (typeof p.body !== 'string') {
    errores.push('body debe ser texto');
  }

  return errores;
}

/** Validación de email suficientemente estricta para chequear respuestas de API. */
export function esEmailValido(email: string): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Detecta IDs repetidos en una colección.
 * Un endpoint de listado nunca debería devolver duplicados.
 */
export function idsDuplicados<T extends { id: number }>(items: T[]): number[] {
  const vistos = new Set<number>();
  const repetidos = new Set<number>();

  for (const item of items) {
    if (vistos.has(item.id)) {
      repetidos.add(item.id);
    }
    vistos.add(item.id);
  }

  return [...repetidos];
}

/** Verifica que un tiempo de respuesta esté dentro del presupuesto acordado. */
export function dentroDelSLA(ms: number, presupuestoMs: number): boolean {
  return ms >= 0 && ms <= presupuestoMs;
}
