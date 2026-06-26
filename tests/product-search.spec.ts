import { test, expect } from '../src/fixtures/test-fixtures.js';
import { Tags } from '../src/types/index.js';

test.describe('Product search', () => {
  test(
    `searching a known term narrows the catalog to matching products ${Tags.Smoke} ${Tags.Critical}`,
    async ({ homePage, productsPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();

      const fullCatalog = await productsPage.productCards.count();
      await productsPage.search('top');

      await expect(productsPage.searchedProductsHeading).toBeVisible();
      const names = await productsPage.visibleProductNames();

      // The search narrows the catalog (it does not return everything)...
      expect(names.length).toBeGreaterThan(0);
      expect(names.length).toBeLessThan(fullCatalog);

      // ...and the searched term dominates the results. automationexercise
      // matches on category as well as name, so a few same-category items
      // (e.g. shirts filed under "Tops") appear without the literal term —
      // assert the majority match rather than demanding every single one.
      const matching = names.filter((n) => n.toLowerCase().includes('top'));
      expect(matching.length).toBeGreaterThan(names.length / 2);
    },
  );

  test(
    `a nonsense search term yields zero result cards ${Tags.Regression} ${Tags.Negative}`,
    async ({ homePage, productsPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();

      await productsPage.search('zzzzz-no-such-product-zzzzz');

      await expect(productsPage.productCards).toHaveCount(0);
    },
  );

  test(
    `products page loads with the full catalog visible ${Tags.Smoke} ${Tags.Mobile}`,
    async ({ homePage, productsPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();

      const count = await productsPage.productCards.count();
      expect(count).toBeGreaterThanOrEqual(10);
    },
  );

  test(
    `clicking "View Product" navigates to the product details page ${Tags.Regression}`,
    async ({ homePage, productsPage, productDetailsPage }) => {
      await homePage.goto();
      await homePage.navigateToProducts();
      await productsPage.viewProduct(0);

      await expect(productDetailsPage.productName).toBeVisible();
      await expect(productDetailsPage.productPrice).toBeVisible();
      await expect(productDetailsPage.addToCartButton).toBeVisible();
    },
  );
});
