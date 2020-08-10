import {
  getConnectionToPriceServiceDatabase,
  getAllCardsFromPriceServiceDatabase,
  getSpecificCardFromPriceServiceDatabase,
  getAllPricesFromPriceServiceDatabase,
  getSpecificPriceFromPriceServiceDatabase,
  upsertPriceIntoDatabase,
} from '../../databases/priceServiceDb';

describe('priceServiceDb', () => {
  const cardsData = [
    {
      id: 1,
      name: 'Air Elemental',
      set: 'Limited Edition Alpha',
      scryfallId: '69c3b2a3-0daa-4d42-832d-fcdfda6555ea',
      tcgplayerId: 1025,
    },
    {
      id: 2,
      name: 'Ancestral Recall',
      set: 'Limited Edition Alpha',
      scryfallId: '70e7ddf2-5604-41e7-bb9d-ddd03d3e9d0b',
      tcgplayerId: 1026,
    },
  ];

  const cardsById = {
    '1': {
      id: 1,
      name: 'Air Elemental',
      set: 'Limited Edition Alpha',
      scryfallId: '69c3b2a3-0daa-4d42-832d-fcdfda6555ea',
      tcgplayerId: 1025,
    },
    '2': {
      id: 2,
      name: 'Ancestral Recall',
      set: 'Limited Edition Alpha',
      scryfallId: '70e7ddf2-5604-41e7-bb9d-ddd03d3e9d0b',
      tcgplayerId: 1026,
    },
  };

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

  const pricesByCardId = {
    '1': {
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
    '2': {
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
  };

  describe('getConnectionToPriceServiceDatabase', () => {
    it('gets and returns a connection to the database', async () => {
      const knex = jest.fn();

      await getConnectionToPriceServiceDatabase(knex);

      expect(knex).toHaveBeenCalledTimes(1);
      expect(knex).toHaveBeenCalledWith({
        client: 'pg',
        connection: {
          host: process.env.PRICE_SERVICE_DB_HOST,
          user: process.env.PRICE_SERVICE_DB_USER,
          password: process.env.PRICE_SERVICE_DB_PASSWORD,
          database: process.env.PRICE_SERVICE_DB_NAME,
          port: process.env.PRICE_SERVICE_DB_PORT,
        },
        asyncStackTraces: process.env.NODE_ENV === 'development',
      });
      expect(knex).toReturn();
    });

    it('returns null if knex throws an error', async () => {
      const knex = jest.fn(() => {
        throw new Error();
      });

      const result = await getConnectionToPriceServiceDatabase(knex);
      expect(knex).toHaveBeenCalledTimes(1);
      expect(knex).toThrow();
      expect(result).toBeNull();
    });
  });

  describe('getAllCardsFromPriceServiceDatabase', () => {
    it('fetches cards from the database if there is a cache miss', async () => {
      const databaseConnection = { from: jest.fn(() => cardsData) };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      const cards = await getAllCardsFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(cards).toEqual(cardsById);
    });

    it('sets the cache if there is a cache miss', async () => {
      const databaseConnection = { from: jest.fn(() => cardsData) };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      await getAllCardsFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(emptyCache.set).toHaveBeenCalledTimes(1);
    });

    it('fetches cards from the cache if there is a cache hit', async () => {
      const databaseConnection = { from: jest.fn(() => []) };
      const cache = { get: jest.fn(() => cardsById), set: jest.fn() };

      const cards = await getAllCardsFromPriceServiceDatabase(databaseConnection, cache);

      expect(cards).toEqual(cardsById);
    });

    it('does NOT set the cache if there is a cache hit', async () => {
      const databaseConnection = { from: jest.fn(() => []) };
      const cache = { get: jest.fn(() => cardsById), set: jest.fn() };

      await getAllCardsFromPriceServiceDatabase(databaseConnection, cache);

      expect(cache.set).toHaveBeenCalledTimes(0);
    });

    it('formats cards into an object keyed by card id', async () => {
      const databaseConnection = { from: jest.fn(() => cardsData) };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      const cards = await getAllCardsFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(cards).toEqual(cardsById);
      expect(cards).not.toEqual(cardsData);
    });

    it('returns an empty set of cards if there is a failure', async () => {
      const databaseConnection = {
        from: jest.fn(() => {
          throw new Error();
        }),
      };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      const cards = await getAllCardsFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(cards).toEqual({});
    });
  });

  describe('getSpecificCardFromPriceServiceDatabase', () => {
    it('returns a card if it is found', async () => {
      const databaseConnection = { from: jest.fn(() => cardsData) };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };
      const existingCardId = 1;

      const card = await getSpecificCardFromPriceServiceDatabase(existingCardId, databaseConnection, emptyCache);

      expect(card).toEqual(cardsById[1]);
    });

    it('returns null if no card is found', async () => {
      const databaseConnection = { from: jest.fn(() => cardsData) };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };
      const missingCardId = 9;

      const card = await getSpecificCardFromPriceServiceDatabase(missingCardId, databaseConnection, emptyCache);

      expect(card).toBeNull();
    });
  });

  describe('getAllPricesFromPriceServiceDatabase', () => {
    it('fetches prices from the database if there is a cache miss', async () => {
      const databaseConnection = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn(() => pricesData),
      };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      const prices = await getAllPricesFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(prices).toEqual(pricesByCardId);
    });

    it('sets the cache if there is a cache miss', async () => {
      const databaseConnection = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn(() => pricesData),
      };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      await getAllPricesFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(emptyCache.set).toHaveBeenCalledTimes(1);
    });

    it('fetches cards from the cache if there is a cache hit', async () => {
      const databaseConnection = { from: jest.fn(() => []) };
      const cache = { get: jest.fn(() => pricesByCardId), set: jest.fn() };

      const prices = await getAllPricesFromPriceServiceDatabase(databaseConnection, cache);

      expect(prices).toEqual(pricesByCardId);
    });

    it('does NOT set the cache if there is a cache hit', async () => {
      const databaseConnection = { from: jest.fn(() => []) };
      const cache = { get: jest.fn(() => pricesByCardId), set: jest.fn() };

      await getAllPricesFromPriceServiceDatabase(databaseConnection, cache);

      expect(cache.set).toHaveBeenCalledTimes(0);
    });

    it('formats prices into an object keyed by card id', async () => {
      const databaseConnection = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn(() => pricesData),
      };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      const prices = await getAllPricesFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(prices).toEqual(pricesByCardId);
      expect(prices).not.toEqual(pricesData);
    });

    it('forces a cache refresh even on a cache hit if forceRefresh is set', async () => {
      const databaseConnection = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn(() => pricesData),
      };
      const cache = { get: jest.fn(() => pricesByCardId), set: jest.fn() };

      const prices = await getAllPricesFromPriceServiceDatabase(databaseConnection, cache, { forceRefresh: true });

      expect(cache.set).toHaveBeenCalledTimes(1);
      expect(databaseConnection.from).toHaveBeenCalledTimes(1);
      expect(prices).toEqual(pricesByCardId);
    });

    it('returns an empty set of prices if there is a failure', async () => {
      const databaseConnection = {
        from: jest.fn(() => {
          throw new Error();
        }),
      };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };

      const prices = await getAllPricesFromPriceServiceDatabase(databaseConnection, emptyCache);

      expect(prices).toEqual({});
    });
  });

  describe('getSpecificPriceFromPriceServiceDatabase', () => {
    it('returns a price if it is found', async () => {
      const databaseConnection = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn(() => pricesData),
      };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };
      const existingCardId = 1;

      const price = await getSpecificPriceFromPriceServiceDatabase(existingCardId, databaseConnection, emptyCache);

      expect(price).toEqual(pricesByCardId[1]);
    });

    it('returns null if no price is found', async () => {
      const databaseConnection = { from: jest.fn(() => pricesData) };
      const emptyCache = { get: jest.fn(() => undefined), set: jest.fn() };
      const missingCardId = 9;

      const price = await getSpecificPriceFromPriceServiceDatabase(missingCardId, databaseConnection, emptyCache);

      expect(price).toBeNull();
    });
  });

  describe('upsertPriceIntoDatabase', () => {
    it('inserts a price if it is not in the database yet', async () => {
      const newPrice = {
        id: 43922,
        cardId: 3,
        tcgplayerId: 1027,
        low: '41.98',
        average: '50.00',
        high: '999.99',
        market: '17.00',
        foil: null,
        createdAt: '2020-07-27T04:41:30.747Z',
        updatedAt: '2020-07-27T06:25:02.446Z',
      };

      const createMockDatabaseConnectionWithNoPrices = () => {
        const where = jest.fn().mockReturnThis();
        const count = jest.fn().mockReturnThis();
        const from = jest.fn(() => [{ count: 0 }]);
        const update = jest.fn().mockReturnThis();
        const insert = jest.fn().mockReturnThis();

        const databaseMethods = {
          where,
          count,
          from,
          update,
          insert,
        };

        const db = jest.fn(() => databaseMethods);
        db.where = where;
        db.count = count;
        db.from = from;
        db.update = update;
        db.insert = insert;

        return db;
      };

      const databaseConnection = createMockDatabaseConnectionWithNoPrices();

      await upsertPriceIntoDatabase(newPrice, databaseConnection);

      expect(databaseConnection.insert).toHaveBeenCalledTimes(1);
    });

    it('updates a price if it is already in the database', async () => {
      const existingPrice = pricesByCardId[1];

      const createMockDatabaseConnectionWithPrices = () => {
        const where = jest.fn().mockReturnThis();
        const count = jest.fn().mockReturnThis();
        const from = jest.fn(() => [{ count: 1 }]);
        const update = jest.fn().mockReturnThis();
        const insert = jest.fn().mockReturnThis();

        const databaseMethods = {
          where,
          count,
          from,
          update,
          insert,
        };

        const db = jest.fn(() => databaseMethods);
        db.where = where;
        db.count = count;
        db.from = from;
        db.update = update;
        db.insert = insert;

        return db;
      };

      const databaseConnection = createMockDatabaseConnectionWithPrices();

      await upsertPriceIntoDatabase(existingPrice, databaseConnection);

      expect(databaseConnection.update).toHaveBeenCalledTimes(1);
    });

    it('handles any errors that may be thrown', async () => {
      const existingPrice = pricesByCardId[1];

      const createMockDatabaseConnectionThatThrowsError = () => {
        const where = jest
          .fn(() => {
            throw new Error();
          })
          .mockReturnThis();
        const count = jest.fn().mockReturnThis();
        const from = jest.fn(() => [{ count: 1 }]);
        const update = jest.fn().mockReturnThis();
        const insert = jest.fn().mockReturnThis();

        const databaseMethods = {
          where,
          count,
          from,
          update,
          insert,
        };

        const db = jest.fn(() => databaseMethods);
        db.where = where;
        db.count = count;
        db.from = from;
        db.update = update;
        db.insert = insert;

        return db;
      };

      const databaseConnection = createMockDatabaseConnectionThatThrowsError();

      await upsertPriceIntoDatabase(existingPrice, databaseConnection);

      expect(upsertPriceIntoDatabase).not.toThrow();
    });
  });
});
