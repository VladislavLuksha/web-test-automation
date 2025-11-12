import { test, expect } from '@playwright/test';
import { testData } from '../../config/testData';
import { CartTestHelpers, PageObjects } from '../helpers/cartTestHelpers';

test.describe('Cart transition cases', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure logged-in and on home page (storageState is already set via global-setup)
    await CartTestHelpers.prepareTestEnvironment(page);
  });

  test('TC1 - Transition to empty cart', async ({ page }) => {
    const { header, cartPopup } = CartTestHelpers.createPageObjects(page);

    // Step 1: Click on cart icon - cart popup should appear
    await CartTestHelpers.openAndVerifyCartPopup(header, cartPopup);

    // Step 2: Verify cart popup is opened (empty cart)
    const itemsCount = await cartPopup.items.count();
    expect(itemsCount).toBe(testData.cart.emptyCount);
  });

  // Parameterized tests for single product scenarios
  const singleProductTestCases: Array<{
    name: string;
    addProduct: (catalog: PageObjects['catalog']) => Promise<void>;
  }> = [
    {
      name: 'TC2 - Transition with 1 non-discounted product',
      addProduct: (catalog) => catalog.addFirstNonDiscounted()
    },
    {
      name: 'TC3 - Transition with 1 discounted product',
      addProduct: (catalog) => catalog.addFirstDiscounted()
    }
  ];

  for (const testCase of singleProductTestCases) {
    test(testCase.name, async ({ page }) => {
      const { catalog, header, cartPopup } = CartTestHelpers.createPageObjects(page);

      await catalog.goto();
      
      // Step 1: Add one product to cart
      await testCase.addProduct(catalog);

      // Step 2: Verify counter shows "1" next to cart icon
      await CartTestHelpers.verifyCartCounter(header, testData.cart.singleItemCount);

      // Step 3: Click on cart icon - cart popup should open
      await CartTestHelpers.openAndVerifyCartPopup(header, cartPopup);
      
      // Step 4: Verify cart popup content: price, product name, total sum
      await CartTestHelpers.verifyCartPopupContent(cartPopup, 1);
    });
  }

  test('TC4 - Transition with 9 different products including one discounted', async ({ page }) => {
    const { catalog, header, cartPopup } = CartTestHelpers.createPageObjects(page);

    await catalog.goto();
    
    // Step 1: Add products to cart
    await catalog.addFirstDiscounted();
    await catalog.addDifferentItems(testData.cart.multipleItemsCount - 1);

    // Step 2: Verify counter shows "9" next to cart icon
    await CartTestHelpers.verifyCartCounter(header, testData.cart.multipleItemsCount);

    // Step 3: Click on cart icon - cart popup should open
    await CartTestHelpers.openAndVerifyCartPopup(header, cartPopup);
    
    // Step 4: Verify cart popup content: price, product name, total sum
    await cartPopup.verifyContent();

    // Step 5: Verify counter shows correct count
    await CartTestHelpers.verifyCartCounterValue(header, testData.cart.multipleItemsCount);
  });

  test('TC5 - Transition with 9 discounted products of the same title', async ({ page }) => {
    const { catalog, header, cartPopup } = CartTestHelpers.createPageObjects(page);

    await catalog.goto();
    
    // Step 1: Add 9 discounted products of the same title to cart
    await catalog.addFirstDiscounted();
    const discountedCard = catalog.discountedProductCards.first();
    await catalog.addSameProduct(discountedCard, testData.cart.multipleItemsCount - 1);

    // Step 2: Verify counter shows "9" next to cart icon
    await CartTestHelpers.verifyCartCounter(header, testData.cart.multipleItemsCount);

    // Step 3: Click on cart icon - cart popup should open
    await CartTestHelpers.openAndVerifyCartPopup(header, cartPopup);
    
    // Step 4: Verify cart popup content: price, product name, total sum
    await cartPopup.verifyContent();

    // Step 5: Verify counter shows correct count
    await CartTestHelpers.verifyCartCounterValue(header, testData.cart.multipleItemsCount);
  });
});