# Web Test Automation

Проект автоматизации тестирования веб-приложения с использованием Playwright и TypeScript.

## 🛠 Технологии

- Playwright
- TypeScript
- Allure (отчеты)

## 📦 Установка

```bash
npm install
npx playwright install
```

## ⚙️ Настройка

Создайте файл `.env` (опционально):

```env
BASE_URL=https://enotes.pointschool.ru
USERNAME=test
PASSWORD=test
```

Авторизация выполняется автоматически через `global-setup.ts`. Состояние сохраняется в `storage/authState.json`.

## 🧪 Запуск тестов

```bash
# Все тесты
npm run test:ui

# UI режим
npx playwright test --ui

# Конкретный браузер
npx playwright test --project=Chromium
```

## 📊 Отчеты

```bash
# Allure
npm run report:generate
npm run report:open

# HTML отчет в playwright-report/index.html
```

## 📁 Структура проекта

```
web-test-automation/
├── config/testData.ts      # Тестовые данные
├── src/pages/              # Page Object Model
│   ├── BasePage.ts
│   ├── CatalogPage.ts
│   ├── CartPopup.ts
│   ├── Header.ts
│   └── LoginPage.ts
├── tests/ui/               # Тесты
│   └── cart.spec.ts
├── storage/                # Состояние авторизации
└── global-setup.ts         # Авторизация
```

## 📝 Тест-кейсы

1. **Переход в пустую корзину**
2. **Переход в корзину с 1 неакционным товаром**
3. **Переход в корзину с 1 акционным товаром**
4. **Переход в корзину с 9 разными товарами**
5. **Переход в корзину с 9 акционными товарами одного наименования**

## 🔧 Команды

```bash
npm run lint      # Проверка кода
npm run format    # Форматирование
```
