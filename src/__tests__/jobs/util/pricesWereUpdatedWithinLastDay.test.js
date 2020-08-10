import { pricesWereUpdatedWithinLastDay } from '../../../jobs/util';

describe('getTimePricesWereLastUpdated', () => {
  it('returns true if prices were updated recently', async () => {
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

    const databaseConnection = { from: jest.fn(() => pricesUpdatedToday) };
    const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

    const result = await pricesWereUpdatedWithinLastDay(databaseConnection, emptyCache);
    expect(result).toBe(true);
  });

  it('returns false if prices were updated longer than a day ago', async () => {
    const pricesUpdatedLongAgo = [
      {
        id: 43920,
        cardId: 1,
        tcgplayerId: 1025,
        low: '78.00',
        average: '81.08',
        high: '84.16',
        market: '51.25',
        foil: null,
        createdAt: '1985-03-13T03:00:00.000Z',
        updatedAt: '1985-03-13T03:00:00.000Z',
      },
    ];

    const databaseConnection = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn(() => pricesUpdatedLongAgo),
    };
    const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

    const result = await pricesWereUpdatedWithinLastDay(databaseConnection, emptyCache);
    expect(result).toBe(false);
  });

  it('returns true if there is any sort of error (to prevent price updates)', async () => {
    const databaseConnection = {
      from: jest.fn(() => {
        throw new Error();
      }),
    };
    const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };
    const result = await pricesWereUpdatedWithinLastDay(databaseConnection, emptyCache);

    expect(result).toBe(true);
  });
});
