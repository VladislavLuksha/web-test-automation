import { Page, Locator } from '@playwright/test';

/**
 * Common locators used across multiple page objects
 */
export class CommonLocators {
  constructor(private readonly page: Page) {}

  get cartLink(): Locator {
    return this.page.getByText('Корзина', { exact: true });
  }

  get cartItems(): Locator {
    return this.page.locator('li').filter({ hasText: /р\./ });
  }

  get clearCartButton(): Locator {
    return this.page
      .getByRole('button', { name: /очистить корзину/i })
      .or(this.page.getByRole('link', { name: /очистить корзину/i }))
      .or(this.page.locator('button, a').filter({ hasText: /очистить корзину/i }));
  }

  get removeItemButton(): Locator {
    return this.page.locator('button, a').filter({ hasText: /удалить|очистить/i });
  }

  get productCards(): Locator {
    return this.page.getByRole('button', { name: /купить/i }).locator('..');
  }

  get buyButton(): Locator {
    return this.page.getByRole('button', { name: /купить/i });
  }

  get discountedProductCards(): Locator {
    return this.productCards.filter({ 
      has: this.page.locator('s, del') 
    });
  }

  get nonDiscountedProductCards(): Locator {
    return this.productCards.filter({ 
      hasNot: this.page.locator('s, del') 
    });
  }
}