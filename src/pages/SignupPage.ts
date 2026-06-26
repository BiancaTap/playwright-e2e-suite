import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import type { UserSignup } from '../types/index.js';

/**
 * /signup — the full account-creation form after the initial name+email step
 * on /login. Reached via LoginPage.startSignup().
 */
export class SignupPage extends BasePage {
  protected readonly path = '/signup';
  protected readonly readySelector = 'form[action="/signup"], h2:has-text("Enter Account Information")';

  // Title
  private get titleMr(): Locator {
    return this.page.locator('#id_gender1');
  }

  private get titleMrs(): Locator {
    return this.page.locator('#id_gender2');
  }

  // Required account fields (name + email are prefilled from the previous step)
  get nameField(): Locator {
    return this.page.locator('#name');
  }

  get emailField(): Locator {
    return this.page.locator('#email');
  }

  get passwordField(): Locator {
    return this.page.locator('#password');
  }

  // DOB
  get dayDropdown(): Locator {
    return this.page.locator('#days');
  }

  get monthDropdown(): Locator {
    return this.page.locator('#months');
  }

  get yearDropdown(): Locator {
    return this.page.locator('#years');
  }

  // Newsletter / offers
  get newsletterCheckbox(): Locator {
    return this.page.locator('#newsletter');
  }

  get offersCheckbox(): Locator {
    return this.page.locator('#optin');
  }

  // Address fields
  get firstNameField(): Locator {
    return this.page.locator('#first_name');
  }

  get lastNameField(): Locator {
    return this.page.locator('#last_name');
  }

  get companyField(): Locator {
    return this.page.locator('#company');
  }

  get address1Field(): Locator {
    return this.page.locator('#address1');
  }

  get address2Field(): Locator {
    return this.page.locator('#address2');
  }

  get countryDropdown(): Locator {
    return this.page.locator('#country');
  }

  get stateField(): Locator {
    return this.page.locator('#state');
  }

  get cityField(): Locator {
    return this.page.locator('#city');
  }

  get zipcodeField(): Locator {
    return this.page.locator('#zipcode');
  }

  get mobileField(): Locator {
    return this.page.locator('#mobile_number');
  }

  get createAccountButton(): Locator {
    return this.page.getByRole('button', { name: /create account/i });
  }

  async fillAccountDetails(user: UserSignup): Promise<void> {
    if (user.title === 'Mr') {
      await this.titleMr.check();
    } else {
      await this.titleMrs.check();
    }
    await this.passwordField.fill(user.password);
    await this.dayDropdown.selectOption(user.dateOfBirth.day);
    await this.monthDropdown.selectOption(user.dateOfBirth.month);
    await this.yearDropdown.selectOption(user.dateOfBirth.year);
    await this.newsletterCheckbox.check();
    await this.offersCheckbox.check();
    await this.firstNameField.fill(user.firstName);
    await this.lastNameField.fill(user.lastName);
    await this.companyField.fill(user.company);
    await this.address1Field.fill(user.address1);
    await this.address2Field.fill(user.address2);
    await this.countryDropdown.selectOption(user.country);
    await this.stateField.fill(user.state);
    await this.cityField.fill(user.city);
    await this.zipcodeField.fill(user.zipcode);
    await this.mobileField.fill(user.mobile);
  }

  async submit(): Promise<void> {
    await this.createAccountButton.click();
    await this.page.waitForURL(/\/account_created/);
  }
}
