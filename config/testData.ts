export const testData = {
  credentials: {
    username: process.env.USERNAME || 'test',
    password: process.env.PASSWORD || 'test'
  },
  urls: {
    login: '/login',
    home: '/',
    cart: '/basket'
  },
  cart: {
    emptyCount: 0,
    singleItemCount: 1,
    multipleItemsCount: 9
  },
  timeouts: {
    short: 300,
    medium: 500,
    default: 1000,
    long: 3000,
    veryLong: 5000
  }
};