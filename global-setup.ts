import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './src/pages/LoginPage';
import { testData } from './config/testData';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseURL = config.projects[0]?.use?.baseURL as string | undefined;

  if (baseURL) {
    await page.goto(baseURL + testData.urls.login);
  } else {
    await page.goto('https://enotes.pointschool.ru' + testData.urls.login);
  }

  // Use LoginPage for authentication
  const loginPage = new LoginPage(page);
  await loginPage.login();
  await page.waitForLoadState('networkidle');
  // Ensure consistent post-login location
  await page.goto((baseURL || 'https://enotes.pointschool.ru') + testData.urls.home);
  await page.waitForLoadState('networkidle');

  // Save storage state
  const storageDir = path.resolve(process.cwd(), 'storage');

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  await context.storageState({ path: path.join(storageDir, 'authState.json') });
  await browser.close();
}

export default globalSetup;