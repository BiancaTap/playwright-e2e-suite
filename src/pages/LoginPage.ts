import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import type { UserCredentials, UserSignup } from '../types/index.js';

/**
 * /login on automationexercise.com hosts BOTH the login form (left column)
 * and the signup-start form (right column: name + email -> /signup full form).
 */
export class LoginPage extends BasePage {
  protected readonly path = '/login';
  protected readonly readySelector = 'form[action="/login"]';

  // ---------- Login (left column) ----------
  get loginForm(): Locator {
    return this.page.locator('form[action="/login"]');
  }

  get loginEmail(): Locator {
    return this.loginForm.locator('input[data-qa="login-email"]');
  }

  get loginPassword(): Locator {
    return this.loginForm.locator('input[data-qa="login-password"]');
  }

  get loginSubmit(): Locator {
    return this.loginForm.locator('button[data-qa="login-button"]');
  }

  get loginError(): Locator {
    return this.loginForm.locator('p:has-text("Your email or password is incorrect!")');
  }

  // ---------- Signup start (right column) ----------
  get signupForm(): Locator {
    return this.page.locator('form[action="/signup"]');
  }

  get signupName(): Locator {
    return this.signupForm.locator('input[data-qa="signup-name"]');
  }

  get signupEmail(): Locator {
    return this.signupForm.locator('input[data-qa="signup-email"]');
  }

  get signupSubmit(): Locator {
    return this.signupForm.locator('button[data-qa="signup-button"]');
  }

  get signupError(): Locator {
    return this.signupForm.locator('p:has-text("Email Address already exist!")');
  }

  // ---------- Intent methods ----------
  async login(creds: UserCredentials): Promise<void> {
    await this.loginEmail.fill(creds.email);
    await this.loginPassword.fill(creds.password);
    await this.loginSubmit.click();
  }

  async startSignup(user: Pick<UserSignup, 'name' | 'email'>): Promise<void> {
    await this.signupName.fill(user.name);
    await this.signupEmail.fill(user.email);
    await this.signupSubmit.click();
    await this.page.waitForURL(/\/signup/);
  }
}
