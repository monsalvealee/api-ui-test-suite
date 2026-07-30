import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

/**
 * Tests de UI del inventario.
 *
 * El login se hace en beforeEach: cada test arranca desde un estado conocido
 * y ninguno depende de que otro haya corrido antes. Esa independencia es lo
 * que permite ejecutarlos en paralelo sin resultados intermitentes.
 */

test.describe('Inventario', () => {
  let inventario: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.ir();
    await login.ingresar('standard_user', 'secret_sauce');

    inventario = new InventoryPage(page);
    await inventario.esperarCarga();
  });

  test('se listan todos los productos', async () => {
    expect(await inventario.cantidadDeItems()).toBe(6);
  });

  test('agregar un producto incrementa el contador del carrito', async () => {
    await expect(inventario.contadorCarrito).toHaveCount(0);

    await inventario.agregarPrimerItem();

    await expect(inventario.contadorCarrito).toBeVisible();
    await expect(inventario.contadorCarrito).toHaveText('1');
  });

  test('el orden por precio ascendente devuelve precios crecientes', async () => {
    await inventario.ordenarPor('lohi');

    const precios = await inventario.preciosVisibles();
    const esperado = [...precios].sort((a, b) => a - b);

    expect(precios).toEqual(esperado);
  });

  test('el orden por precio descendente devuelve precios decrecientes', async () => {
    await inventario.ordenarPor('hilo');

    const precios = await inventario.preciosVisibles();
    const esperado = [...precios].sort((a, b) => b - a);

    expect(precios).toEqual(esperado);
  });

  test('todo producto muestra nombre, descripción y precio', async ({
    page,
  }) => {
    const cantidad = await inventario.cantidadDeItems();

    for (let i = 0; i < cantidad; i++) {
      const item = inventario.items.nth(i);
      await expect(item.locator('[data-test="inventory-item-name"]')).not.toBeEmpty();
      await expect(item.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
      await expect(item.locator('[data-test="inventory-item-price"]')).toContainText('$');
    }
  });
});
