import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonLocators } from './locators';
import { testData } from '../../config/testData';

export class Header extends BasePage {
  private readonly locators: CommonLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CommonLocators(page);
  }

  async openMiniCart(): Promise<void> {
    await this.safeClick(this.locators.cartLink);
    await this.waitForNetworkIdle(testData.timeouts.medium);
  }

  async getCounter(): Promise<number> {
    const cartElement = this.locators.cartLink;
    const parent = cartElement.locator('..');
    const badge = parent.locator('text=/^\\d+$/');
    
    try {
      const text = await badge.first().textContent();
      if (text) {
        const count = parseInt(text.trim(), 10);
        if (!Number.isNaN(count)) {
          return count;
        }
      }
    } catch (error) {
    }
    
    return 0;
  }
}