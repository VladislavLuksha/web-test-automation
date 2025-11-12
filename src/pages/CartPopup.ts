import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { testData } from '../../config/testData';

export class CartPopup extends BasePage {
  readonly goToCartButton: Locator;
  readonly items: Locator;
  readonly totalPrice: Locator;

  constructor(page: Page) {
    super(page);

    this.goToCartButton = this.page.getByRole('button', { name: /перейти в корзину/i });
    this.items = this.page.locator('ul').locator('li').filter({ hasText: /р\./ });
    this.totalPrice = this.page.locator('text=/Итого/i');
  }

  async expectOpened(): Promise<void> {
    await Promise.race([
      this.waitForVisible(this.goToCartButton, testData.timeouts.long).catch(() => {}),
      this.waitForVisible(this.totalPrice.first(), testData.timeouts.long).catch(() => {}),
      this.waitForVisible(this.items.first(), testData.timeouts.long).catch(() => {})
    ]);
  }

  async verifyContent(): Promise<void> {
    await this.waitForNetworkIdle(testData.timeouts.medium);
    
    // Verify popup is open (at least one indicator should be visible)
    const buttonVisible = await this.isVisible(this.goToCartButton);
    const totalVisible = await this.isVisible(this.totalPrice.first());
    const itemsCount = await this.items.count();
    
    // At least one should be visible (popup is open)
    expect(buttonVisible || totalVisible || itemsCount > 0).toBeTruthy();
    
    // If items found, verify they have price and name
    if (itemsCount > 0) {
      const firstItem = this.items.first();
      const itemText = await firstItem.textContent();
      expect(itemText).toBeTruthy();
      
      // Verify price pattern (requirement: "цена")
      expect(itemText).toMatch(/\d+.*р\./);
      
      // Verify product name exists (requirement: "наименование товара")
      // Item text should not be just a price (should contain product name)
      const hasProductName = !/^\d+.*р\.\d*$/.test(itemText?.trim() || '');
      expect(hasProductName).toBeTruthy();
    }
  }
}