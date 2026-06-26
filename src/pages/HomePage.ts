import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class HomePage extends BasePage {
  protected readonly path = '/';
  protected readonly readySelector = '#slider';

  get signupLoginLink(): Locator {
    return this.page.getByRole('link', { name: /signup \/ login/i });
  }

  get productsLink(): Locator {
    return this.page.locator('#header').getByRole('link', { name: 'Products' });
  }

  get cartLink(): Locator {
    return this.page.locator('#header').getByRole('link', { name: 'Cart' });
  }

  get contactUsLink(): Locator {
    return this.page.getByRole('link', { name: /contact us/i });
  }

  get featuredProductCards(): Locator {
    return this.page.locator('.features_items .product-image-wrapper');
  }

  async navigateToSignupLogin(): Promise<void> {
    await this.signupLoginLink.click();
    await this.page.waitForURL(/\/login/);
  }

  async navigateToProducts(): Promise<void> {
    await this.productsLink.click();
    await this.page.waitForURL(/\/products/);
  }

  async navigateToCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL(/\/view_cart/);
  }

  async navigateToContactUs(): Promise<void> {
    await this.contactUsLink.click();
    await this.page.waitForURL(/\/contact_us/);
  }
}
