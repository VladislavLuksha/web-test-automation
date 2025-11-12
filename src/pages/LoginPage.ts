import { Page, expect } from '@playwright/test';
import { testData } from '../../config/testData';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly loginInput = () => 
    this.page.getByLabel('Логин').or(this.page.getByPlaceholder('Логин клиента'));
  
  private readonly passwordInput = () => 
    this.page.getByLabel('Пароль').or(this.page.getByPlaceholder('Пароль клиента'));
  
  private readonly loginButton = () => 
    this.page.getByRole('button', { name: 'Вход' });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto(testData.urls.login);
  }

  /**
   * Perform login with credentials
   * @param username - Username (defaults to testData.credentials.username)
   * @param password - Password (defaults to testData.credentials.password)
   */
  async login(username: string = testData.credentials.username, password: string = testData.credentials.password): Promise<void> {
    const submitButton = this.loginButton();

    // Fill in credentials
    await this.safeFill(this.loginInput(), username);
    await this.safeFill(this.passwordInput(), password);
    
    await this.page.waitForTimeout(500);
    
    // Click submit button (use force if needed as form validation might keep it disabled)
    try {
      await this.safeClick(submitButton);
    } catch (error) {
      // If normal click fails, try force click
      await submitButton.click({ force: true });
    }
    
    // Wait for navigation or load state
    try {
      await this.page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
    } catch (error) {
      // If URL doesn't change, wait for load state as fallback
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    }
  }
}