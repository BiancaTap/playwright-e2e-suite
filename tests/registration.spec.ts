import { test, expect } from '../src/fixtures/test-fixtures.js';
import { Tags } from '../src/types/index.js';
import { makeUser } from '../src/utils/data-factory.js';

test.describe('Registration flow', () => {
  test(
    `a new user can register end-to-end and lands on the account-created confirmation ${Tags.Smoke} ${Tags.Critical}`,
    async ({ homePage, loginPage, signupPage, accountCreatedPage, user }) => {
      await homePage.goto();
      await homePage.navigateToSignupLogin();

      await loginPage.startSignup({ name: user.name, email: user.email });
      await expect(signupPage.emailField).toHaveValue(user.email);
      await expect(signupPage.nameField).toHaveValue(user.name);

      await signupPage.fillAccountDetails(user);
      await signupPage.submit();

      await expect(accountCreatedPage.heading).toBeVisible();
      await accountCreatedPage.continueToHome();
      await expect(homePage.loggedInBadge).toContainText(user.name);
    },
  );

  test(
    `attempting to register with an already-used email surfaces the duplicate-account error ${Tags.Regression} ${Tags.Negative}`,
    async ({ page, homePage, loginPage, registeredUser }) => {
      // registeredUser left us logged in; sign out so we can hit /login again.
      await homePage.logout();

      // Submitting the signup-start form with an already-registered email posts
      // to /signup and re-renders there with the duplicate-account error (rather
      // than advancing to the full account-details form).
      await loginPage.startSignup({ name: 'Duplicate', email: registeredUser.email });

      await expect(loginPage.signupError).toBeVisible();
      await expect(page).toHaveURL(/\/signup/);
    },
  );

  test(
    `the signup-start form requires both name and email ${Tags.Regression} ${Tags.Negative}`,
    async ({ page, homePage, loginPage }) => {
      await homePage.goto();
      await homePage.navigateToSignupLogin();

      // HTML5 required validation: submitting empty keeps us on the login page.
      await loginPage.signupSubmit.click();
      await expect(page).toHaveURL(/\/login/);

      // The first invalid input should be one of the required ones.
      const nameValidity = await loginPage.signupName.evaluate(
        (el: HTMLInputElement) => el.validity.valueMissing,
      );
      expect(nameValidity).toBe(true);
    },
  );

  test(
    `signup with newsletter unchecked still creates an account ${Tags.Regression}`,
    async ({ homePage, loginPage, signupPage, accountCreatedPage }) => {
      const u = makeUser();
      await homePage.goto();
      await homePage.navigateToSignupLogin();
      await loginPage.startSignup({ name: u.name, email: u.email });

      await signupPage.fillAccountDetails(u);
      await signupPage.newsletterCheckbox.uncheck();
      await signupPage.submit();

      await expect(accountCreatedPage.heading).toBeVisible();
    },
  );
});
