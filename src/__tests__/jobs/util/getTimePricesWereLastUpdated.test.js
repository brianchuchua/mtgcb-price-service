import { getTimePricesWereLastUpdated } from '../../../jobs/util';

describe('getTimePricesWereLastUpdated', () => {
  const pricesData = [
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
      updatedAt: '2020-08-01T12:53:23.136Z',
    },
    {
      id: 43921,
      cardId: 2,
      tcgplayerId: 1026,
      low: '7999.99',
      average: '7999.99',
      high: '7999.99',
      market: null,
      foil: null,
      createdAt: '2020-07-27T04:41:30.741Z',
      updatedAt: '2020-08-01T12:53:23.143Z',
    },
  ];

  it('returns updatedAt for the first price if it exists', async () => {
    const databaseConnection = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn(() => pricesData),
    };
    const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

    const updatedAt = await getTimePricesWereLastUpdated(databaseConnection, emptyCache);

    expect(updatedAt).toBe(pricesData[0].updatedAt);
  });

  it('returns null if there are no prices yet', async () => {
    const databaseConnection = { from: jest.fn(() => []) };
    const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

    const updatedAt = await getTimePricesWereLastUpdated(databaseConnection, emptyCache);

    expect(updatedAt).toBeNull();
  });

  it('returns null if any error occurs', async () => {
    const databaseConnection = {
      from: jest.fn(() => {
        throw new Error();
      }),
    };
    const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

    const updatedAt = await getTimePricesWereLastUpdated(databaseConnection, emptyCache);

    expect(updatedAt).toBeNull();
  });
});
