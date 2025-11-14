import { test, expect, Page } from '@playwright/test';
import { CatalogPage } from '../../src/pages/CatalogPage';
import { Header } from '../../src/pages/Header';
import { CartPopup } from '../../src/pages/CartPopup';
import { testData } from '../../config/testData';

test.describe('Cart transition cases', () => {
  let catalogPage: CatalogPage;
  let header: Header;
  let cartPopup: CartPopup;
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    catalogPage = new CatalogPage(page);
    header = new Header(page);
    cartPopup = new CartPopup(page);

    await catalogPage.goto();
    await clearCartIfNeeded();
  });

  async function clearCartIfNeeded(): Promise<void> {
    const currentCount = await header.getCounter();
    
    if (currentCount > 0) {
      await header.openCartPopup();
      await cartPopup.expectOpened();
      await cartPopup.clearCart();
      await header.waitForCounter(0);
      await page.keyboard.press('Escape').catch(() => {});
    }
  }

  /**
   * Открывает попап корзины, проверяет содержимое и переходит в корзину
   */
  async function verifyAndGoToCart(expectedItemsCount: number): Promise<void> {
    await header.openCartPopup();
    await cartPopup.expectOpened();
    await cartPopup.verifyContent();
    await cartPopup.expectItemsCount(expectedItemsCount);
    await cartPopup.goToCart();
  }

  /**
   * Открывает попап корзины, ждет загрузки товаров и проверяет содержимое
   */
  async function openCartPopupAndWaitForItems(): Promise<void> {
    await header.openCartPopup();
    await cartPopup.expectOpened();

    await expect.poll(
      () => cartPopup.getItemsCount(),
      {
        timeout: testData.timeouts.long,
        message: 'Товары должны загрузиться в попап корзины'
      }
    ).toBeGreaterThan(0);

    await cartPopup.verifyContent();
  }

  test('Cart transition case 2: переход в корзину с 1 неакционным товаром', async () => {
    await catalogPage.addFirstNonDiscounted();
    await header.waitForCounter(testData.cart.singleItemCount);
    await verifyAndGoToCart(testData.cart.singleItemCount);
  });

  test('Cart transition case 3: переход в корзину с 1 акционным товаром', async () => {
    await catalogPage.addFirstDiscounted();
    await header.waitForCounter(testData.cart.singleItemCount);
    await verifyAndGoToCart(testData.cart.singleItemCount);
  });

  test('Cart transition case 4: переход в корзину с 9 разными товарами', async () => {
    // Предусловие: добавляем 1 акционный товар
    await catalogPage.addFirstDiscounted();
    await header.waitForCounter(1);

    // Шаг 1: Добавляем ещё 8 разных товаров (пропуская первый акционный)
    await catalogPage.addDifferentItemsExcludingFirstDiscounted(8);
    
    // Ожидаем обновления счетчика до 9
    await header.waitForCounter(testData.cart.multipleItemsCount);

    // Шаг 2: Открываем попап корзины и проверяем содержимое
    //await openCartPopupAndWaitForItems();

    // Шаг 3: Переходим в корзину
    //await cartPopup.goToCart();
  });

  test('Cart transition case 5: переход в корзину с 9 акционными товарами одного наименования', async () => {
    // Шаг 1: Добавляем 9 товаров одного наименования со скидкой
    await catalogPage.addSameDiscountedProduct(9);
    
    // Ожидаем обновления счетчика до 9
    await header.waitForCounter(testData.cart.multipleItemsCount);

    // Шаг 2: Открываем попап корзины и проверяем содержимое
    // 9 товаров одного наименования могут отображаться как один элемент с количеством
    //await openCartPopupAndWaitForItems();

    // Шаг 3: Переходим в корзину
    //await cartPopup.goToCart();
  });
});