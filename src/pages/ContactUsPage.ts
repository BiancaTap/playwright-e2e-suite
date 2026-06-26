import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import type { ContactMessage } from '../types/index.js';

export class ContactUsPage extends BasePage {
  protected readonly path = '/contact_us';
  protected readonly readySelector = 'h2:has-text("Get In Touch")';

  get nameField(): Locator {
    return this.page.locator('input[data-qa="name"]');
  }

  get emailField(): Locator {
    return this.page.locator('input[data-qa="email"]');
  }

  get subjectField(): Locator {
    return this.page.locator('input[data-qa="subject"]');
  }

  get messageField(): Locator {
    return this.page.locator('#message');
  }

  get uploadInput(): Locator {
    return this.page.locator('input[name="upload_file"]');
  }

  get submitButton(): Locator {
    return this.page.locator('input[data-qa="submit-button"]');
  }

  get successMessage(): Locator {
    return this.page.locator('.status.alert.alert-success');
  }

  async fillForm(message: ContactMessage): Promise<void> {
    await this.nameField.fill(message.name);
    await this.emailField.fill(message.email);
    await this.subjectField.fill(message.subject);
    await this.messageField.fill(message.message);
  }

  /**
   * Submit + auto-accept the native confirm() dialog the page raises.
   */
  async submit(): Promise<void> {
    this.page.once('dialog', (d) => void d.accept());
    await this.submitButton.click();
  }
}
