import {
  validarPost,
  esEmailValido,
  idsDuplicados,
  dentroDelSLA,
} from '../src/validators';

/**
 * Tests unitarios con Jest.
 *
 * No tocan la red: corren en milisegundos. Sirven para verificar la lógica de
 * validación en sí, antes de usarla contra respuestas reales de la API.
 */

describe('validarPost', () => {
  const postValido = {
    userId: 1,
    id: 1,
    title: 'un título',
    body: 'un cuerpo',
  };

  it('acepta un post bien formado', () => {
    expect(validarPost(postValido)).toEqual([]);
  });

  it('rechaza un id que no sea número positivo', () => {
    expect(validarPost({ ...postValido, id: 0 })).toContain(
      'id debe ser un número positivo',
    );
    expect(validarPost({ ...postValido, id: 'uno' })).toContain(
      'id debe ser un número positivo',
    );
  });

  it('rechaza un title vacío o con solo espacios', () => {
    expect(validarPost({ ...postValido, title: '   ' })).toContain(
      'title no puede estar vacío',
    );
  });

  it('acumula todos los errores en lugar de cortar en el primero', () => {
    const errores = validarPost({ id: -1, userId: 0, title: '', body: 42 });
    expect(errores).toHaveLength(4);
  });

  it('rechaza valores que no sean objetos', () => {
    expect(validarPost(null)).toEqual(['El dato no es un objeto']);
    expect(validarPost('texto')).toEqual(['El dato no es un objeto']);
  });
});

describe('esEmailValido', () => {
  it.each([
    'usuario@dominio.com',
    'nombre.apellido@empresa.com.ar',
    'a@b.io',
  ])('acepta %s', (email) => {
    expect(esEmailValido(email)).toBe(true);
  });

  it.each([
    'sin-arroba.com',
    '@sin-usuario.com',
    'sin@dominio',
    'con espacio@dominio.com',
    '',
  ])('rechaza %s', (email) => {
    expect(esEmailValido(email)).toBe(false);
  });
});

describe('idsDuplicados', () => {
  it('devuelve lista vacía cuando todos los ids son únicos', () => {
    expect(idsDuplicados([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual([]);
  });

  it('detecta un id repetido', () => {
    expect(idsDuplicados([{ id: 1 }, { id: 2 }, { id: 1 }])).toEqual([1]);
  });

  it('no repite el mismo id en el resultado', () => {
    expect(idsDuplicados([{ id: 5 }, { id: 5 }, { id: 5 }])).toEqual([5]);
  });

  it('maneja una colección vacía', () => {
    expect(idsDuplicados([])).toEqual([]);
  });
});

describe('dentroDelSLA', () => {
  it('acepta un tiempo por debajo del presupuesto', () => {
    expect(dentroDelSLA(120, 500)).toBe(true);
  });

  it('acepta un tiempo exactamente igual al presupuesto', () => {
    expect(dentroDelSLA(500, 500)).toBe(true);
  });

  it('rechaza un tiempo por encima del presupuesto', () => {
    expect(dentroDelSLA(501, 500)).toBe(false);
  });

  it('rechaza tiempos negativos', () => {
    expect(dentroDelSLA(-1, 500)).toBe(false);
  });
});
