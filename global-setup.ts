import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './src/pages/LoginPage';
import { testData } from './config/testData';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseURL = config.projects[0]?.use?.baseURL as string | undefined || process.env.BASE_URL || 'https://enotes.pointschool.ru';

  try {
    await page.goto(baseURL + testData.urls.login);
    await page.waitForLoadState('domcontentloaded');

    const loginPage = new LoginPage(page);
    await loginPage.login();
    
    await page.waitForLoadState('networkidle', { timeout: testData.timeouts.veryLong * 2 });
    
    await page.goto(baseURL + testData.urls.home);
    await page.waitForLoadState('networkidle', { timeout: testData.timeouts.veryLong * 2 });

    const storageDir = path.resolve(process.cwd(), 'storage');

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    await context.storageState({ path: path.join(storageDir, 'authState.json') });
    console.log('✓ Authentication state saved successfully');
  } catch (error) {
    console.error('✗ Failed to setup authentication:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;