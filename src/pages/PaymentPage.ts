import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import type { PaymentDetails } from '../types/index.js';

export class PaymentPage extends BasePage {
  protected readonly path = '/payment';
  protected readonly readySelector = 'form#payment-form, h2:has-text("Payment")';

  get nameOnCard(): Locator {
    return this.page.locator('input[name="name_on_card"]');
  }

  get cardNumber(): Locator {
    return this.page.locator('input[name="card_number"]');
  }

  get cvc(): Locator {
    return this.page.locator('input[name="cvc"]');
  }

  get expiryMonth(): Locator {
    return this.page.locator('input[name="expiry_month"]');
  }

  get expiryYear(): Locator {
    return this.page.locator('input[name="expiry_year"]');
  }

  get payAndConfirmButton(): Locator {
    return this.page.locator('#submit');
  }

  get orderPlacedConfirmation(): Locator {
    return this.page.locator('h2[data-qa="order-placed"], p:has-text("Congratulations! Your order has been confirmed!")');
  }

  async pay(details: PaymentDetails): Promise<void> {
    await this.nameOnCard.fill(details.nameOnCard);
    await this.cardNumber.fill(details.cardNumber);
    await this.cvc.fill(details.cvc);
    await this.expiryMonth.fill(details.expiryMonth);
    await this.expiryYear.fill(details.expiryYear);
    await this.payAndConfirmButton.click();
  }
}
