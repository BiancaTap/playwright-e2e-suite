import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ProductsPage extends BasePage {
  protected readonly path = '/products';
  protected readonly readySelector = 'h2:has-text("All Products")';

  get searchInput(): Locator {
    return this.page.locator('#search_product');
  }

  get searchButton(): Locator {
    return this.page.locator('#submit_search');
  }

  get searchedProductsHeading(): Locator {
    return this.page.locator('h2:has-text("Searched Products")');
  }

  get productCards(): Locator {
    return this.page.locator('.features_items .product-image-wrapper');
  }

  /**
   * Returns visible product names. Useful for asserting that search results
   * contain the term.
   */
  async visibleProductNames(): Promise<string[]> {
    const names = await this.productCards.locator('.productinfo p').allTextContents();
    return names.map((n) => n.trim());
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.searchedProductsHeading.waitFor();
  }

  /**
   * Clicks a product card's "Add to cart" button. Each card has two such
   * links — the always-visible one in `.productinfo` and a duplicate in the
   * hover overlay. We click the `.productinfo` one directly: hovering first
   * reveals the overlay, which intercepts the click on Firefox.
   */
  async addProductToCart(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await card.scrollIntoViewIfNeeded();
    await card.locator('.productinfo a.add-to-cart').click();
    await this.page.locator('.modal-content:has-text("Added!")').waitFor();
  }

  async continueShoppingFromModal(): Promise<void> {
    await this.page.getByRole('button', { name: /continue shopping/i }).click();
  }

  async viewCartFromModal(): Promise<void> {
    await this.page.getByRole('link', { name: /view cart/i }).click();
    await this.page.waitForURL(/\/view_cart/);
  }

  async viewProduct(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await card.locator('a:has-text("View Product")').click();
    await this.page.waitForURL(/\/product_details\//);
  }
}
