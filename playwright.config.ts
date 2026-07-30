import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright.
 *
 * Se definen dos "proyectos" separados porque los tests de API y los de UI
 * tienen necesidades distintas: los de API no necesitan navegador y por eso
 * corren mucho más rápido.
 */
export default defineConfig({
  testDir: './tests',

  // Corre los archivos de test en paralelo entre sí.
  fullyParallel: true,

  // En CI falla el build si alguien dejó un test.only olvidado.
  forbidOnly: !!process.env.CI,

  // Un reintento en CI absorbe la inestabilidad de red; en local, ninguno,
  // porque un test que falla localmente conviene verlo fallar.
  retries: process.env.CI ? 1 : 0,

  // En CI un solo worker hace los resultados reproducibles.
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // Solo guarda evidencia cuando algo falla: mantiene el repo liviano.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://jsonplaceholder.typicode.com',
      },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
      },
    },
  ],
});
