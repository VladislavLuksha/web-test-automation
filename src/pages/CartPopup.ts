import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { testData } from '../../config/testData';

export class CartPopup extends BasePage {
  readonly goToCartButton: Locator;
  readonly items: Locator;
  readonly totalPrice: Locator;
  readonly clearCartButton: Locator;

  constructor(page: Page) {
    super(page);
    
    this.goToCartButton = this.page.locator('a[href="/basket"]').filter({ hasText: /перейти в корзину/i });
    this.items = this.page.locator('.basket-item');
    this.totalPrice = this.page.getByText(/итого.*к оплате/i);
    this.clearCartButton = this.page.getByRole('button', { name: /очистить.*корзин/i });
  }

  async expectOpened(): Promise<void> {
    await this.waitForVisible(this.page.locator('#basketContainer'), testData.timeouts.long);
    await expect(this.goToCartButton).toBeVisible({ timeout: testData.timeouts.long });
  }

  async verifyContent(): Promise<void> {
    const itemsCount = await this.items.count();
    
    if (itemsCount > 0) {
      for (let i = 0; i < itemsCount; i++) {
        const item = this.items.nth(i);
        const itemTitle = item.locator('.basket-item-title');
        const itemPrice = item.locator('.basket-item-price');
        
        await this.expectValidTitle(itemTitle);
        await this.expectValidPrice(itemPrice);
      }
      
      await expect(this.totalPrice).toBeVisible();
      const totalText = await this.getTextContent(this.totalPrice);
      expect(totalText).toMatch(/итого.*\d+/i);
    }
  }

  async expectItemsCount(expectedCount: number): Promise<void> {
    await expect.poll(
      () => this.getItemsCount(),
      { timeout: testData.timeouts.long }
    ).toBe(expectedCount);
  }

  async expectValidPrice(locator: Locator): Promise<void> {
    const priceText = await this.getTextContent(locator);
    expect(priceText.trim()).toBeTruthy();
    expect(priceText).toMatch(/\d+[\s\S]*?р\.?/i);
  }

  async expectValidTitle(locator: Locator): Promise<void> {
    const titleText = await this.getTextContent(locator);
    expect(titleText.trim()).toBeTruthy();
  }

  async getItemsCount(): Promise<number> {
    return this.items.count();
  }

  async goToCart(): Promise<void> {
    await this.goToCartButton.click();
    await this.waitForUrl(/\/basket/, testData.timeouts.long);
  }

  async clearCart(): Promise<void> {
    if (await this.getItemsCount() === 0) {
      return;
    }

    await this.clearCartButton.click();
    await this.expectItemsCount(0);
  }
}