import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ProductDetailsPage extends BasePage {
  protected readonly path = '/product_details';
  protected readonly readySelector = '.product-information';

  get productName(): Locator {
    return this.page.locator('.product-information h2');
  }

  get productPrice(): Locator {
    return this.page.locator('.product-information span span');
  }

  get availability(): Locator {
    return this.page.locator('.product-information p:has-text("Availability")');
  }

  get quantityInput(): Locator {
    return this.page.locator('#quantity');
  }

  get addToCartButton(): Locator {
    return this.page.locator('button.cart');
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.page.locator('.modal-content:has-text("Added!")').waitFor();
  }

  async viewCartFromModal(): Promise<void> {
    await this.page.getByRole('link', { name: /view cart/i }).click();
    await this.page.waitForURL(/\/view_cart/);
  }
}
