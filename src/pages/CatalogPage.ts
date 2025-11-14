import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { testData } from '../../config/testData';

export class CatalogPage extends BasePage {
  readonly productCards: Locator;
  readonly discountedProductCards: Locator;
  readonly nonDiscountedProductCards: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = this.page.locator('.note-item');
    this.discountedProductCards = this.page.locator('.note-item.hasDiscount');
    this.nonDiscountedProductCards = this.page.locator('.note-item:not(.hasDiscount)');
    this.nextPageButton = this.page.locator('.pagination .page-item:not(.active) .page-link').first();
  }

  async goto(): Promise<void> {
    await super.goto('/');
    await this.waitForVisible(this.productCards.first(), testData.timeouts.default);
  }

  private async addProductByCard(card: Locator): Promise<void> {
    const button = card.locator('.actionBuyProduct');
    await button.click();
  }

  async addFirstNonDiscounted(): Promise<void> {
    const card = this.nonDiscountedProductCards.first();
    await this.addProductByCard(card);
  }

  async addFirstDiscounted(): Promise<void> {
    const card = this.discountedProductCards.first();
    await this.addProductByCard(card);
  }

  async addSameProduct(card: Locator, count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.addProductByCard(card);
    }
  }

  /**
   * Добавляет один и тот же акционный товар несколько раз
   * @param count - количество раз для добавления товара
   */
  async addSameDiscountedProduct(count: number): Promise<void> {
    const card = this.discountedProductCards.first();
    await this.addSameProduct(card, count);
  }

  async addDifferentItems(count: number, startIndex: number = 0): Promise<void> {
    const cardsCount = await this.productCards.count();
    const toAdd = Math.min(cardsCount - startIndex, count);
    
    for (let i = startIndex; i < startIndex + toAdd; i++) {
      const card = this.productCards.nth(i);
      await this.addProductByCard(card);
    }
  }

  private async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.waitForVisible(this.productCards.first(), testData.timeouts.long);
  }

  /**
   * Находит индекс первого акционного товара на текущей странице
   */
  private async findFirstDiscountedIndex(): Promise<number> {
    const discountedCount = await this.discountedProductCards.count();
    if (discountedCount === 0) {
      return -1;
    }
    
    const firstDiscountedHandle = await this.discountedProductCards.first().elementHandle();
    if (!firstDiscountedHandle) {
      return -1;
    }
    
    const cardsCount = await this.productCards.count();
    for (let i = 0; i < cardsCount; i++) {
      const cardHandle = await this.productCards.nth(i).elementHandle();
      if (cardHandle && (await firstDiscountedHandle.evaluate((el1, el2) => el1 === el2, cardHandle))) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Проверяет доступность карточки товара для добавления
   */
  private async isCardAvailable(card: Locator): Promise<boolean> {
    const button = card.locator('.actionBuyProduct');
    return this.isVisible(button);
  }

  /**
   * Добавляет товары на текущей странице, пропуская указанный индекс
   */
  private async addItemsOnCurrentPage(count: number, skipIndex: number = -1): Promise<number> {
    let added = 0;
    const cardsCount = await this.productCards.count();
    
    for (let i = 0; i < cardsCount && added < count; i++) {
      if (i === skipIndex) continue;
      
      const card = this.productCards.nth(i);
      if (await this.isCardAvailable(card)) {
        await this.addProductByCard(card);
        added++;
      }
    }
    
    return added;
  }

  /**
   * Добавляет разные товары, пропуская первый акционный товар (который уже в корзине)
   * @param count - количество товаров для добавления
   */
  async addDifferentItemsExcludingFirstDiscounted(count: number): Promise<void> {
    let added = 0;
    let isFirstPage = true;
    let firstDiscountedIndex = await this.findFirstDiscountedIndex();
    
    while (added < count) {
      const skipIndex = isFirstPage ? firstDiscountedIndex : -1;
      const addedOnPage = await this.addItemsOnCurrentPage(
        count - added,
        skipIndex
      );
      
      added += addedOnPage;
      
      if (added < count) {
        try {
          await this.goToNextPage();
          isFirstPage = false;
          firstDiscountedIndex = -1;
        } catch (e) {
          // Если не удалось перейти на следующую страницу, прекращаем добавление
          break;
        }
      }
    }
  }
}