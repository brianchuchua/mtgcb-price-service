import { warmUpPriceCache } from '../../../jobs/util';
import { getAllPricesFromPriceServiceDatabase } from '../../../databases/priceServiceDb';

jest.mock('../../../databases/priceServiceDb', () => ({
  getAllPricesFromPriceServiceDatabase: jest.fn(() => Promise.resolve()),
}));

describe('warmUpPriceCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('warms up the price cache', async () => {
    const databaseConnection = { from: jest.fn() };
    const cache = { get: jest.fn(), set: jest.fn() };

    await warmUpPriceCache(databaseConnection, cache);

    expect(getAllPricesFromPriceServiceDatabase).toBeCalled();
  });
});
