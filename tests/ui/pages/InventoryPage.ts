import { Page, Locator, expect } from '@playwright/test';

/** Page Object de la pantalla de inventario (post-login). */
export class InventoryPage {
  readonly page: Page;
  readonly titulo: Locator;
  readonly items: Locator;
  readonly contadorCarrito: Locator;
  readonly selectorOrden: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titulo = page.locator('.title');
    this.items = page.locator('[data-test="inventory-item"]');
    this.contadorCarrito = page.locator('.shopping_cart_badge');
    this.selectorOrden = page.locator('[data-test="product-sort-container"]');
  }

  async esperarCarga(): Promise<void> {
    await expect(this.titulo).toHaveText('Products');
  }

  async cantidadDeItems(): Promise<number> {
    return this.items.count();
  }

  /** Agrega el primer producto disponible al carrito. */
  async agregarPrimerItem(): Promise<void> {
    await this.items.first().locator('button').click();
  }

  async ordenarPor(valor: string): Promise<void> {
    await this.selectorOrden.selectOption(valor);
  }

  /** Devuelve los precios visibles como números, en el orden en que aparecen. */
  async preciosVisibles(): Promise<number[]> {
    const textos = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return textos.map((t) => parseFloat(t.replace('$', '')));
  }
}
