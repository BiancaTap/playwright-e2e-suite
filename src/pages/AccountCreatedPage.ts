import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class AccountCreatedPage extends BasePage {
  protected readonly path = '/account_created';
  protected readonly readySelector = 'h2[data-qa="account-created"]';

  get heading(): Locator {
    return this.page.locator('h2[data-qa="account-created"]');
  }

  get continueButton(): Locator {
    return this.page.locator('a[data-qa="continue-button"]');
  }

  async continueToHome(): Promise<void> {
    await this.continueButton.click();
    await this.page.waitForURL((url) => url.pathname === '/');
  }
}
