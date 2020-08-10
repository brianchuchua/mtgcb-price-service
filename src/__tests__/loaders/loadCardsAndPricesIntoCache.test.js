import loadCardsAndPricesIntoCache from '../../loaders/loadCardsAndPricesIntoCache';
import { ALL_CARDS } from '../../constants/cacheKeys';

const pricesInDatabase = [
  {
    id: 43920,
    cardId: 1,
    tcgplayerId: 1025,
    low: '78.00',
    average: '81.08',
    high: '84.16',
    market: '51.25',
    foil: null,
    createdAt: '2020-07-27T04:41:30.733Z',
    updatedAt: '2020-07-27T04:41:30.733Z',
  },
  {
    id: 43921,
    cardId: 2,
    tcgplayerId: 1026,
    low: 7999.99,
    average: 7999.99,
    high: 7999.99,
    market: null,
    foil: null,
    createdAt: '2020-07-27T04:41:30.733Z',
    updatedAt: '2020-07-27T04:41:30.733Z',
  },
];

const cards = [
  {
    id: 1,
    name: 'Air Elemental',
    set: 'Limited Edition Alpha',
    scryfallId: '69c3b2a3-0daa-4d42-832d-fcdfda6555ea',
    tcgplayerId: '1025',
  },
  {
    id: 2,
    name: 'Ancestral Recall',
    set: 'Limited Edition Alpha',
    scryfallId: '70e7ddf2-5604-41e7-bb9d-ddd03d3e9d0b',
    tcgplayerId: '1026',
  },
];

const mockDatabaseConnection = {
  from: jest.fn((table) => {
    switch (table) {
      case 'Price':
        return pricesInDatabase;
      case 'Card':
        return cards;
      default:
        return null;
    }
  }),
  select: jest.fn().mockReturnThis(),
  leftJoin: jest.fn(() => pricesInDatabase),
};

jest.mock('../../databases/priceServiceDb', () => {
  const priceServiceDb = jest.requireActual('../../databases/priceServiceDb');

  return {
    getConnectionToPriceServiceDatabase: jest.fn(() => Promise.resolve(mockDatabaseConnection)),
    getAllCardsFromPriceServiceDatabase: jest
      .fn()
      .mockImplementation(priceServiceDb.getAllCardsFromPriceServiceDatabase),
    getAllPricesFromPriceServiceDatabase: jest.fn().mockImplementation(priceServiceDb.getAllPricesFromPriceServiceDatabase), // eslint-disable-line
  };
});

describe('loadCardsAndPricesIntoCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('binds the cache to the application context', async () => {
    const app = { context: {} };

    await loadCardsAndPricesIntoCache(app);

    expect(app.context.cache).toBeDefined();
  });

  it('binds the database to the application context', async () => {
    const app = { context: {} };

    await loadCardsAndPricesIntoCache(app);

    expect(app.context.db).toBeDefined();
  });

  it('loads all card data into cache', async () => {
    const app = { context: {} };

    await loadCardsAndPricesIntoCache(app);

    expect(app.context.cache.get(ALL_CARDS)).toBeDefined();
  });
});
