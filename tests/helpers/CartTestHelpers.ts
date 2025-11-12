import { expect, Page } from '@playwright/test';
import { CatalogPage } from '../../src/pages/CatalogPage';
import { CartPage } from '../../src/pages/CartPage';
import { Header } from '../../src/pages/Header';
import { CartPopup } from '../../src/pages/CartPopup';
import { LoginPage } from '../../src/pages/LoginPage';
import { testData } from '../../config/testData';

/**
 * Page objects returned by createPageObjects
 */
export interface PageObjects {
  catalog: CatalogPage;
  header: Header;
  cartPopup: CartPopup;
  cartPage: CartPage;
}

/**
 * Test helpers for cart transition tests
 */
export class CartTestHelpers {
  /**
   * Initialize page objects for a test
   */
  static createPageObjects(page: Page): PageObjects {
    return {
      catalog: new CatalogPage(page),
      header: new Header(page),
      cartPopup: new CartPopup(page),
      cartPage: new CartPage(page),
    };
  }

  /**
   * Prepare test environment: ensure login and empty cart
   */
  static async prepareTestEnvironment(page: Page): Promise<void> {
    await page.goto(testData.urls.home);
    const loginPage = new LoginPage(page);
    
    // If we somehow got logged out, login again
    if (await page.getByRole('button', { name: /войти|логин|sign in/i }).isVisible().catch(() => false)) {
      await loginPage.login();
    }
    
    // Clean the cart before each test
    const cartPage = new CartPage(page);
    await cartPage.empty();
    await page.goto(testData.urls.home);
  }

  /**
   * Verify cart counter shows expected count
   */
  static async verifyCartCounter(header: Header, expectedCount: number): Promise<void> {
    await expect.poll(
      async () => await header.getCounter(),
      { timeout: testData.timeouts.veryLong }
    ).toBe(expectedCount);
  }

  /**
   * Open cart popup and verify it's opened
   */
  static async openAndVerifyCartPopup(header: Header, cartPopup: CartPopup): Promise<void> {
    await header.openMiniCart();
    await cartPopup.expectOpened();
  }

  /**
   * Verify cart popup content and items count
   */
  static async verifyCartPopupContent(cartPopup: CartPopup, minItemsCount: number = 0): Promise<void> {
    await cartPopup.verifyContent();
    const itemsCount = await cartPopup.items.count();
    expect(itemsCount).toBeGreaterThanOrEqual(minItemsCount);
  }

  /**
   * Verify cart counter value (for tests with multiple items)
   */
  static async verifyCartCounterValue(header: Header, expectedCount: number): Promise<void> {
    const counter = await header.getCounter();
    expect(counter).toBe(expectedCount);
  }
}