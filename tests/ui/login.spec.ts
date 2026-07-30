import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

/**
 * Tests de UI del flujo de autenticación.
 *
 * Los selectores viven en los Page Objects; acá solo se describe el
 * comportamiento esperado.
 */

const USUARIO_VALIDO = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('Login', () => {
  let login: LoginPage;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.ir();
  });

  test('un usuario válido accede al inventario', async ({ page }) => {
    await login.ingresar(USUARIO_VALIDO, PASSWORD);

    const inventario = new InventoryPage(page);
    await inventario.esperarCarga();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('una contraseña incorrecta muestra el error correspondiente', async () => {
    await login.ingresar(USUARIO_VALIDO, 'password-incorrecta');
    await login.esperarError('Username and password do not match');
  });

  test('un usuario bloqueado no puede ingresar', async () => {
    await login.ingresar('locked_out_user', PASSWORD);
    await login.esperarError('Sorry, this user has been locked out');
  });

  test('los campos vacíos disparan validación', async () => {
    await login.ingresar('', '');
    await login.esperarError('Username is required');
  });

  test('la contraseña vacía se valida por separado', async () => {
    await login.ingresar(USUARIO_VALIDO, '');
    await login.esperarError('Password is required');
  });
});
