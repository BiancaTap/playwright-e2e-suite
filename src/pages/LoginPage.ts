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
    // Wait for a settled outcome — either the logged-in badge (success, on the
    // home page) or the inline error (failure, still on /login) — so callers
    // don't assert against a still-blank page on a slow live-site response.
    // Both outcomes are valid; we don't assert which, just that one rendered.
    await this.page
      .locator('a:has-text("Logged in as"), form[action="/login"] p:has-text("incorrect")')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => {
        /* leave the assertion to the caller; a true blank still fails there */
      });
  }

  /**
   * Submits the name+email signup-start form. Normally this lands on the full
   * /signup account-details form, but with an already-registered email it
   * re-renders with a duplicate-account error instead — both are valid settled
   * outcomes. The live site also intermittently serves a slow/empty response
   * under load, leaving /signup blank so neither appears; we treat *that* as a
   * transient and retry from a freshly-loaded /login. A genuine defect still
   * fails every attempt rather than being masked.
   */
  async startSignup(user: Pick<UserSignup, 'name' | 'email'>): Promise<void> {
    const attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      // The whole submit+navigation is guarded: under load the live site can
      // time out the navigation entirely or serve a browser error page, in
      // which case waitForURL throws. Either way we retry from a fresh /login.
      try {
        await this.signupName.fill(user.name);
        await this.signupEmail.fill(user.email);
        await this.signupSubmit.click();
        await this.page.waitForURL(/\/signup/, { timeout: 15_000 });

        // Settled = either the account-info form rendered (happy path) or the
        // duplicate-email error rendered (negative path). Only a blank page —
        // neither showing — counts as a transient worth retrying.
        const settled = await this.page
          .locator(
            '#id_gender1, h2:has-text("Enter Account Information"), p:has-text("Email Address already exist!")',
          )
          .first()
          .waitFor({ state: 'visible', timeout: 8_000 })
          .then(() => true)
          .catch(() => false);
        if (settled) return;
      } catch {
        // navigation timed out / site served an error page — fall through to retry
      }

      if (attempt === attempts) {
        throw new Error(
          `/signup did not render after ${attempts} attempts ` +
            `(live site repeatedly served a blank/error page)`,
        );
      }
      await this.goto(); // back to a freshly-loaded /login, then retry
    }
  }
}
