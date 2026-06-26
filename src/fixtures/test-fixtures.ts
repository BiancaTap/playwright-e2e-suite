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
 * Third-party consent / ad / analytics traffic that interferes with the app
 * under test. Two distinct failure modes, both blocked at the network layer:
 *
 *  1. Consent overlay — Google Funding Choices' `.fc-consent-root` renders a
 *     full-screen banner that steals pointer events, timing out every click.
 *  2. Ad interstitial — Google AdSense serves a full-page "vignette" ad on
 *     navigation (via `googlesyndication.com` / `googleads.g.doubleclick.net`).
 *     It intermittently hijacks a navigation and leaves the destination page
 *     blank, so elements like the account-created heading never render. This is
 *     the classic source of flaky failures against automationexercise.com.
 *
 * Blocking these is test-only and does not change the app's own behaviour — none
 * of the patterns match the site's first-party origin or its `/api` endpoints.
 */
const THIRD_PARTY_BLOCKLIST =
  /fundingchoicesmessages\.google\.com|fundingchoices|googletagservices|consensu\.org|cookielaw\.org|googlesyndication\.com|googleads\.g\.doubleclick\.net|doubleclick\.net|adservice\.google\.|adtrafficquality\.google|googletagmanager\.com|google-analytics\.com/;

export const test = base.extend<Pages & Data & Flows>({
  context: async ({ context }, use) => {
    await context.route(THIRD_PARTY_BLOCKLIST, (route) => route.abort());
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
