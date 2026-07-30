import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object del formulario de login.
 *
 * El patrón Page Object concentra los selectores en un solo lugar. Si mañana
 * cambia el id de un input, se corrige acá y no en los diez tests que lo usan.
 * Los tests quedan describiendo QUÉ se verifica, no CÓMO se llega al elemento.
 */
export class LoginPage {
  readonly page: Page;
  readonly campoUsuario: Locator;
  readonly campoPassword: Locator;
  readonly botonLogin: Locator;
  readonly mensajeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.campoUsuario = page.locator('[data-test="username"]');
    this.campoPassword = page.locator('[data-test="password"]');
    this.botonLogin = page.locator('[data-test="login-button"]');
    this.mensajeError = page.locator('[data-test="error"]');
  }

  async ir(): Promise<void> {
    await this.page.goto('/');
  }

  async ingresar(usuario: string, password: string): Promise<void> {
    await this.campoUsuario.fill(usuario);
    await this.campoPassword.fill(password);
    await this.botonLogin.click();
  }

  async esperarError(textoEsperado: string): Promise<void> {
    await expect(this.mensajeError).toBeVisible();
    await expect(this.mensajeError).toContainText(textoEsperado);
  }
}
