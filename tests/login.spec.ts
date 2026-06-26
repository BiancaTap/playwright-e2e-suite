import { test, expect } from '../src/fixtures/test-fixtures.js';
import { Tags } from '../src/types/index.js';
import { makeCredentials } from '../src/utils/data-factory.js';

test.describe('Login flow', () => {
  test(
    `valid credentials route the user to the home page in a logged-in state ${Tags.Smoke} ${Tags.Critical}`,
    async ({ homePage, loginPage, registeredUser }) => {
      // registeredUser fixture leaves us logged in; force a fresh login cycle.
      await homePage.logout();
      await loginPage.login({ email: registeredUser.email, password: registeredUser.password });

      await expect(homePage.loggedInBadge).toBeVisible();
      await expect(homePage.loggedInBadge).toContainText(registeredUser.name);
    },
  );

  test(
    `invalid credentials surface an inline error and keep the user on /login ${Tags.Regression} ${Tags.Negative}`,
    async ({ page, homePage, loginPage }) => {
      await homePage.goto();
      await homePage.navigateToSignupLogin();

      await loginPage.login(
        makeCredentials({ email: 'nobody@example.invalid', password: 'wrong-pass-123!' }),
      );

      await expect(loginPage.loginError).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    },
  );

  test(
    `logout terminates the session and returns the user to /login ${Tags.Regression}`,
    async ({ homePage, registeredUser }) => {
      await expect(homePage.loggedInBadge).toContainText(registeredUser.name);
      await homePage.logout();
      await expect(homePage.signupLoginLink).toBeVisible();
    },
  );

  test(
    `protected nav state: an anonymous user sees Signup/Login but no Logout link ${Tags.Smoke}`,
    async ({ homePage }) => {
      await homePage.goto();
      await expect(homePage.signupLoginLink).toBeVisible();
      await expect(homePage.logoutLink).toBeHidden();
    },
  );
});
