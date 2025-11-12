import { Page, Locator, expect } from '@playwright/test';
import { testData } from '../../config/testData';
import { BasePage } from './BasePage';
import { CommonLocators } from './locators';

export class CartPage extends BasePage {
  readonly items: Locator;
  private readonly locators: CommonLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CommonLocators(page);

    this.items = this.locators.cartItems;
  }

  async goto(): Promise<void> {
    await super.goto(testData.urls.home);
    await this.waitForNetworkIdle(testData.timeouts.default);
    // Wait for cart link to be visible before clicking
    await this.waitForVisible(this.locators.cartLink, testData.timeouts.veryLong);
    await this.safeClick(this.locators.cartLink);
    await this.waitForNetworkIdle(testData.timeouts.medium);
  }

  async empty(): Promise<void> {
    await super.goto(testData.urls.home);
    await this.waitForNetworkIdle(testData.timeouts.default);
    
    // Check if cart link is visible, if not, cart might already be empty
    const cartLinkVisible = await this.isVisible(this.locators.cartLink);
    if (!cartLinkVisible) {
      return; // Cart is likely already empty or page not loaded
    }
    
    await this.waitForVisible(this.locators.cartLink, testData.timeouts.veryLong);
    await this.safeClick(this.locators.cartLink);
    await this.waitForNetworkIdle(testData.timeouts.medium);
    
    // Try to use clear cart button if available
    const clearButton = this.locators.clearCartButton.first();
    const clearButtonExists = await clearButton.count() > 0;
    
    if (clearButtonExists) {
      try {
        await clearButton.click({ force: true });
        await this.waitForCount(this.items, 0);
        return;
      } catch (error) {
      }
    }
    
    await this.removeItemsOneByOne();
  }

  /**
   * Remove cart items one by one until cart is empty
   */
  private async removeItemsOneByOne(): Promise<void> {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const currentCount = await this.items.count();
      if (currentCount === 0) {
        break;
      }
      
      const removeButton = this.locators.removeItemButton.first();
      const isButtonVisible = await this.isVisible(removeButton);
      
      if (!isButtonVisible) {
        break;
      }
      
      await this.safeClick(removeButton);
      await this.waitForNetworkIdle(testData.timeouts.short);
      
      // Wait for count to decrease
      await expect.poll(
        async () => await this.items.count(),
        { timeout: testData.timeouts.long }
      ).not.toBe(currentCount);
      
      attempts++;
    }
    
    await this.waitForCount(this.items, 0);
  }
}