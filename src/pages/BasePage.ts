import { Page, expect, Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  protected async waitForVisible(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  protected async waitForNetworkIdle(timeout: number = 1000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible().catch(() => false);
  }

  /**
   * Wait for element count to match expected value
   */
  protected async waitForCount(locator: Locator, expectedCount: number, timeout: number = 5000): Promise<void> {
    await expect.poll(async () => await locator.count(), { timeout }).toBe(expectedCount);
  }

  /**
   * Safely click on element with waiting for visibility
   */
  protected async safeClick(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    await this.waitForVisible(locator, options?.timeout);
    await locator.click({ force: options?.force });
  }

  /**
   * Safely fill input field with waiting for visibility
   */
  protected async safeFill(locator: Locator, value: string, timeout: number = 5000): Promise<void> {
    await this.waitForVisible(locator, timeout);
    await locator.fill(value);
  }
}