import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { testData } from '../../config/testData';

export class Header extends BasePage {
  readonly cartIcon: Locator;
  readonly cartCounter: Locator;

  constructor(page: Page) {
    super(page);
    this.cartIcon = this.page.locator('#dropdownBasket');
    this.cartCounter = this.page.locator('.basket-count-items');
  }

  async getCounter(): Promise<number> {
    const text = await this.getTextContent(this.cartCounter);
    const match = text.trim().match(/^\d+$/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async openCartPopup(): Promise<void> {
    await this.cartIcon.click();
  }

  /**
   * Ожидает обновления счетчика корзины до указанного значения
   */
  async waitForCounter(expectedCount: number, timeout: number = testData.timeouts.veryLong): Promise<void> {
    await expect.poll(
      () => this.getCounter(),
      { 
        timeout,
        message: `Счетчик корзины должен обновиться до ${expectedCount}`
      }
    ).toBe(expectedCount);
  }
}