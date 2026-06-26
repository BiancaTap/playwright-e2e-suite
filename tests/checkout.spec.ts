import { test, expect } from '../src/fixtures/test-fixtures.js';
import { Tags } from '../src/types/index.js';
import { makePayment } from '../src/utils/data-factory.js';

test.describe('Checkout flow', () => {
  test(
    `adding a product to the cart updates the cart count and shows the line item ${Tags.Smoke} ${Tags.Critical}`,
    async ({ homePage, productsPage, cartPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();
      await productsPage.addProductToCart(0);
      await productsPage.viewCartFromModal();

      expect(await cartPage.itemCount()).toBe(1);
    },
  );

  test(
    `quantity selected on the product details page is reflected in the cart ${Tags.Regression}`,
    async ({ homePage, productsPage, productDetailsPage, cartPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();
      await productsPage.viewProduct(0);

      await productDetailsPage.setQuantity(3);
      await productDetailsPage.addToCart();
      await productDetailsPage.viewCartFromModal();

      expect(await cartPage.quantityAt(0)).toBe(3);
    },
  );

  test(
    `removing the last item from the cart shows the empty-cart message ${Tags.Regression}`,
    async ({ homePage, productsPage, cartPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();
      await productsPage.addProductToCart(0);
      await productsPage.viewCartFromModal();

      await cartPage.removeAt(0);
      await expect(cartPage.emptyMessage).toBeVisible();
    },
  );

  test(
    `anonymous checkout is gated behind login: the cart modal offers register/login ${Tags.Regression} ${Tags.Negative}`,
    async ({ homePage, productsPage, cartPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();
      await productsPage.addProductToCart(0);
      await productsPage.viewCartFromModal();

      await cartPage.proceedToCheckout();
      await expect(cartPage.registerLoginLinkInModal).toBeVisible();
    },
  );

  test(
    `full happy-path: register, add to cart, checkout, pay, confirm order ${Tags.Regression} ${Tags.Critical}`,
    async ({
      registeredUser,
      productsPage,
      cartPage,
      checkoutPage,
      paymentPage,
      homePage,
    }) => {
      await homePage.navigateToProducts();
      await productsPage.addProductToCart(0);
      await productsPage.viewCartFromModal();

      expect(await cartPage.itemCount()).toBe(1);
      await cartPage.proceedToCheckout();

      await expect(checkoutPage.deliveryAddress).toContainText(registeredUser.firstName);
      await checkoutPage.addComment('Please leave at the door.');
      await checkoutPage.placeOrder();

      await paymentPage.pay(makePayment(registeredUser));
      await expect(paymentPage.orderPlacedConfirmation.first()).toBeVisible({ timeout: 20_000 });
    },
  );
});
