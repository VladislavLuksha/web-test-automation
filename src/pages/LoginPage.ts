import { Page, Locator, expect } from '@playwright/test';
import { testData } from '../../config/testData';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly loginInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginInput = this.page.getByLabel('Логин');
    this.passwordInput = this.page.getByLabel('Пароль');
    this.loginButton = this.page.getByRole('button', { name: 'Вход' });
  }

  async goto(): Promise<void> {
    await super.goto(testData.urls.login);
  }

  async login(username: string = testData.credentials.username, password: string = testData.credentials.password): Promise<void> {
    await this.loginInput.fill(username);
    await this.passwordInput.fill(password);
    
    await Promise.all([
      this.waitForUrl(url => !url.toString().includes('/login'), testData.timeouts.veryLong * 3),
      this.loginButton.click()
    ]);
  }
}