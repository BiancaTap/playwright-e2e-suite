import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CartPage extends BasePage {
  protected readonly path = '/view_cart';
  protected readonly readySelector = '#cart_items, p:has-text("Cart is empty")';

  get cartRows(): Locator {
    return this.page.locator('#cart_info_table tbody tr');
  }

  get emptyMessage(): Locator {
    return this.page.locator('p:has-text("Cart is empty")');
  }

  get proceedToCheckoutButton(): Locator {
    return this.page.locator('a.check_out').first();
  }

  /**
   * In the unauth flow, the modal offers "Register / Login" instead of letting
   * the user check out as guest.
   */
  get registerLoginLinkInModal(): Locator {
    return this.page.locator('.modal-body').getByRole('link', { name: /register \/ login/i });
  }

  async itemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async productNameAt(index: number): Promise<string> {
    return (await this.cartRows.nth(index).locator('.cart_description a').textContent())?.trim() ?? '';
  }

  async quantityAt(index: number): Promise<number> {
    const raw = await this.cartRows.nth(index).locator('.cart_quantity button').textContent();
    return Number(raw?.trim() ?? '0');
  }

  async removeAt(index: number): Promise<void> {
    const row = this.cartRows.nth(index);
    await row.locator('.cart_quantity_delete').click();
    await row.waitFor({ state: 'detached' });
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }
}
