import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { SignupPage } from '../pages/SignupPage.js';
import { AccountCreatedPage } from '../pages/AccountCreatedPage.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { ProductDetailsPage } from '../pages/ProductDetailsPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { PaymentPage } from '../pages/PaymentPage.js';
import { ContactUsPage } from '../pages/ContactUsPage.js';
import { makeUser } from '../utils/data-factory.js';
import type { UserSignup } from '../types/index.js';

interface Pages {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountCreatedPage: AccountCreatedPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  contactUsPage: ContactUsPage;
}

interface Data {
  user: UserSignup;
}

interface Flows {
  /**
   * Creates a brand-new account through the full UI signup flow and leaves
   * the browser logged in on the home page. Returns the user credentials
   * used so the test can assert against them.
   */
  registeredUser: UserSignup;
}

/**
 * Third-party consent / ad-funding scripts that render a full-screen overlay
 * (Google Funding Choices' `.fc-consent-root`) on top of the page and steal
 * pointer events, causing every click to time out. We block them at the
 * network layer so the banner never renders. This is test-only and does not
 * change the behaviour of the app under test.
 */
const CONSENT_SCRIPT_BLOCKLIST =
  /fundingchoicesmessages\.google\.com|fundingchoices|googletagservices|consensu\.org|cookielaw\.org/;

export const test = base.extend<Pages & Data & Flows>({
  context: async ({ context }, use) => {
    await context.route(CONSENT_SCRIPT_BLOCKLIST, (route) => route.abort());
    await use(context);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountCreatedPage: async ({ page }, use) => use(new AccountCreatedPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
  contactUsPage: async ({ page }, use) => use(new ContactUsPage(page)),

  user: async ({}, use) => {
    await use(makeUser());
  },

  registeredUser: async (
    { homePage, loginPage, signupPage, accountCreatedPage, user },
    use,
  ) => {
    await homePage.goto();
    await homePage.navigateToSignupLogin();
    await loginPage.startSignup({ name: user.name, email: user.email });
    await signupPage.fillAccountDetails(user);
    await signupPage.submit();
    await accountCreatedPage.continueToHome();
    await use(user);
  },
});

export { expect } from '@playwright/test';
