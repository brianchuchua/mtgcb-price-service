import { updateAllPrices } from '../../jobs';
import { getTcgplayerPricesForCard } from '../../network/tcgplayer';
import {
  upsertPriceIntoDatabase,
  getSpecificPriceFromPriceServiceDatabase,
  getAllCardsFromPriceServiceDatabase,
  getAllPricesFromPriceServiceDatabase,
} from '../../databases/priceServiceDb';
import { warmUpPriceCache, pricesWereUpdatedWithinLastDay } from '../../jobs/util';

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

const mockPricesInTcgplayer = {
  1: [
    {
      cardId: 1,
      productId: 1025,
      lowPrice: 78.0,
      midPrice: 81.08,
      highPrice: 84.16,
      marketPrice: 51.25,
      directLowPrice: 78.0,
      subTypeName: 'Normal',
    },
    {
      cardId: 1,
      productId: 1025,
      lowPrice: null,
      midPrice: null,
      highPrice: null,
      marketPrice: null,
      directLowPrice: null,
      subTypeName: 'Foil',
    },
  ],
  2: [
    {
      cardId: 2,
      productId: 1026,
      lowPrice: 7999.99,
      midPrice: 7999.99,
      highPrice: 7999.99,
      marketPrice: null,
      directLowPrice: null,
      subTypeName: 'Normal',
    },
    {
      cardId: 2,
      productId: 1026,
      lowPrice: null,
      midPrice: null,
      highPrice: null,
      marketPrice: null,
      directLowPrice: null,
      subTypeName: 'Foil',
    },
  ],
};

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

const databaseConnection = {
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
};

const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

jest.mock('../../network/tcgplayer', () => ({
  getTcgplayerPricesForCard: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../databases/priceServiceDb', () => ({
  upsertPriceIntoDatabase: jest.fn(() => Promise.resolve()),
  getSpecificPriceFromPriceServiceDatabase: jest.fn(() => Promise.resolve()),
  getAllCardsFromPriceServiceDatabase: jest.fn(() => Promise.resolve()),
  getAllPricesFromPriceServiceDatabase: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../jobs/util', () => ({
  warmUpPriceCache: jest.fn(() => Promise.resolve()),
  pricesWereUpdatedWithinLastDay: jest.fn(() => Promise.resolve()),
}));

describe('updateAllPrices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSpecificPriceFromPriceServiceDatabase.mockResolvedValue(pricesInDatabase[0]);
    getAllCardsFromPriceServiceDatabase.mockResolvedValue(cards);
    getAllPricesFromPriceServiceDatabase.mockResolvedValue(pricesInDatabase);
    pricesWereUpdatedWithinLastDay.mockResolvedValue(false);
    getTcgplayerPricesForCard.mockImplementation((card) =>
      Promise.resolve({ [card.id]: mockPricesInTcgplayer[card.id] })
    );
  });

  it('returns null and shortcuts if prices have been updated recently', async () => {
    const pricesUpdatedToday = [
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
        updatedAt: new Date().toISOString(),
      },
    ];
    const databaseConnectionToday = { from: jest.fn(() => pricesUpdatedToday) };
    pricesWereUpdatedWithinLastDay.mockResolvedValue(true);

    const result = await updateAllPrices(databaseConnectionToday, emptyCache);

    expect(result).toBe(null);
  });

  it('calls the tcgplayer api for each card', async () => {
    await updateAllPrices(databaseConnection, emptyCache);

    expect(getTcgplayerPricesForCard).toBeCalledTimes(2);
  });

  it('upserts each price into the database', async () => {
    await updateAllPrices(databaseConnection, emptyCache);

    expect(upsertPriceIntoDatabase).toBeCalledTimes(2);
    expect(upsertPriceIntoDatabase).toHaveBeenNthCalledWith(
      1,
      { cardId: 1, tcgplayerId: 1025, low: 78.0, average: 81.08, high: 84.16, market: 51.25, foil: null },
      databaseConnection
    );
    expect(upsertPriceIntoDatabase).toHaveBeenNthCalledWith(
      2,
      { cardId: 2, tcgplayerId: 1026, low: 7999.99, average: 7999.99, high: 7999.99, market: null, foil: null },
      databaseConnection
    );
  });

  it('refreshes the cache once upserting is complete', async () => {
    await updateAllPrices(databaseConnection, emptyCache);

    expect(warmUpPriceCache).toBeCalledTimes(1);
  });
});
