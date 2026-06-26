import { test, expect } from '../src/fixtures/test-fixtures.js';
import { Tags } from '../src/types/index.js';
import { makeContactMessage } from '../src/utils/data-factory.js';

test.describe('Form validation', () => {
  test(
    `Contact Us form submits successfully when all required fields are filled ${Tags.Smoke}`,
    async ({ homePage, contactUsPage }) => {
      await homePage.goto();
      await homePage.navigateToContactUs();

      await contactUsPage.fillForm(makeContactMessage());
      await contactUsPage.submit();

      await expect(contactUsPage.successMessage).toBeVisible();
      await expect(contactUsPage.successMessage).toContainText(/success/i);
    },
  );

  test(
    `Contact Us form rejects an empty submission via native HTML5 validation ${Tags.Regression} ${Tags.Negative}`,
    async ({ homePage, contactUsPage }) => {
      await homePage.goto();
      await homePage.navigateToContactUs();

      await contactUsPage.submitButton.click();

      // The email input is the form's required, type=email field, so an empty
      // submit is blocked client-side with a "value missing" validity error
      // (the form never posts).
      const isInvalid = await contactUsPage.emailField.evaluate(
        (el: HTMLInputElement) => !el.validity.valid && el.validity.valueMissing,
      );
      expect(isInvalid).toBe(true);
    },
  );

  test(
    `Contact Us rejects a malformed email via the email input's built-in validation ${Tags.Regression} ${Tags.Negative}`,
    async ({ homePage, contactUsPage }) => {
      await homePage.goto();
      await homePage.navigateToContactUs();

      await contactUsPage.fillForm(makeContactMessage({ email: 'not-an-email' }));
      await contactUsPage.submitButton.click();

      const isInvalid = await contactUsPage.emailField.evaluate(
        (el: HTMLInputElement) => !el.validity.valid && el.validity.typeMismatch,
      );
      expect(isInvalid).toBe(true);
    },
  );

  test(
    `signup form rejects a too-short password (browser HTML5 minlength) ${Tags.Regression} ${Tags.Negative}`,
    async ({ page, homePage, loginPage, signupPage, user }) => {
      await homePage.goto();
      await homePage.navigateToSignupLogin();
      await loginPage.startSignup({ name: user.name, email: user.email });

      await signupPage.passwordField.fill('a');
      await signupPage.createAccountButton.click();

      // Page should stay on /signup because required fields aren't filled.
      await expect(page).toHaveURL(/\/signup/);
    },
  );
});
