import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';
  protected readonly readySelector = 'h2:has-text("Address Details"), h2:has-text("Review Your Order")';

  get deliveryAddress(): Locator {
    return this.page.locator('#address_delivery');
  }

  get billingAddress(): Locator {
    return this.page.locator('#address_invoice');
  }

  get orderReviewRows(): Locator {
    return this.page.locator('#cart_info_table tbody tr.cart_product, #cart_info_table tbody tr');
  }

  get commentTextarea(): Locator {
    return this.page.locator('textarea[name="message"]');
  }

  get placeOrderButton(): Locator {
    return this.page.getByRole('link', { name: /place order/i });
  }

  async addComment(text: string): Promise<void> {
    await this.commentTextarea.fill(text);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.page.waitForURL(/\/payment/);
  }
}
