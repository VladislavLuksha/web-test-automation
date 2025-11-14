import { Page, Locator } from '@playwright/test';
import { testData } from '../../config/testData';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  protected async waitForVisible(locator: Locator, timeout: number = testData.timeouts.veryLong): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible().catch(() => false);
  }

  protected async waitForNetworkIdle(timeout: number = testData.timeouts.default, ignoreErrors: boolean = true): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch {
      if (!ignoreErrors) {
        throw new Error(`Network idle timeout after ${timeout}ms`);
      }
    }
  }

  async waitForUrl(url: string | RegExp | ((url: URL) => boolean), timeout: number = testData.timeouts.long): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  protected async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  protected async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent().catch(() => null)) || '';
  }

  protected async waitForText(locator: Locator, text: string | RegExp, timeout: number = testData.timeouts.long): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.filter({ hasText: text }).waitFor({ state: 'visible', timeout });
  }
}