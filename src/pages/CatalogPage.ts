import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonLocators } from './locators';
import { testData } from '../../config/testData';


export class CatalogPage extends BasePage {
  readonly productCards: Locator;
  readonly discountedProductCards: Locator;
  readonly nonDiscountedProductCards: Locator;
  private readonly locators: CommonLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CommonLocators(page);
    this.productCards = this.locators.productCards;
    this.discountedProductCards = this.locators.discountedProductCards;
    this.nonDiscountedProductCards = this.locators.nonDiscountedProductCards;
  }

  async goto(): Promise<void> {
    await super.goto('/');
    await this.waitForVisible(this.productCards.first());
  }

  /**
   * Add product to cart by card locator
   * @param card - Product card locator
   * @private
   */
  private async addProductByCard(card: Locator): Promise<void> {
    await this.waitForVisible(card);
    const button = card.getByRole('button', { name: /купить/i });
    await this.safeClick(button);
    await this.waitForNetworkIdle(testData.timeouts.medium);
  }

  /**
   * Add first non-discounted product to cart
   * Finds product without crossed-out price (s/del tags)
   */
  async addFirstNonDiscounted(): Promise<void> {
    const card = this.nonDiscountedProductCards.first();
    await this.addProductByCard(card);
  }

  /**
   * Add first discounted product to cart
   * Finds product with crossed-out price (s/del tags)
   */
  async addFirstDiscounted(): Promise<void> {
    const card = this.discountedProductCards.first();
    await this.addProductByCard(card);
  }

  /**
   * Add the same product multiple times to cart
   * @param card - Product card locator
   * @param count - Number of times to add the product
   */
  async addSameProduct(card: Locator, count: number): Promise<void> {
    await this.waitForVisible(card);
    
    for (let i = 0; i < count; i++) {
      const button = card.getByRole('button', { name: /купить/i });
      await this.safeClick(button);
      await this.waitForNetworkIdle(testData.timeouts.short);
    }
  }

  /**
   * Add multiple different items to cart
   * @param count - Number of different items to add
   */
  async addDifferentItems(count: number): Promise<void> {
    const cardsCount = await this.productCards.count();
    const toAdd = Math.min(cardsCount, count);
    
    for (let i = 0; i < toAdd; i++) {
      const button = this.productCards.nth(i).getByRole('button', { name: /купить/i });
      await this.safeClick(button);
      await this.waitForNetworkIdle(testData.timeouts.short);
    }
  }
}