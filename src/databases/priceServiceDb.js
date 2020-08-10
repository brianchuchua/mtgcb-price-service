import keyBy from 'lodash/keyBy';
import { ALL_CARDS, ALL_PRICES } from '../constants/cacheKeys';

export const getConnectionToPriceServiceDatabase = async (knex) => {
  try {
    const databaseConnection = await knex({
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

    return databaseConnection;
  } catch (error) {
    console.error(`[Error] Failed to getConnectionToPriceServiceDatabase: ${JSON.stringify(error)}`);
    return null;
  }
};

export const getAllCardsFromPriceServiceDatabase = async (
  databaseConnection,
  cache,
  options = { forceRefresh: false }
) => {
  let cards = cache.get(ALL_CARDS);
  if (cards == null || options.forceRefresh) {
    try {
      cards = await databaseConnection.from('Card');
      cards = keyBy(cards, 'id');
      cache.set(ALL_CARDS, cards);
    } catch (error) {
      console.error(`[Error] Failed to getAllCardsFromPriceServiceDatabase: ${JSON.stringify(error)}`);
      return {};
    }
  }
  return cards;
};

export const getSpecificCardFromPriceServiceDatabase = async (id, databaseConnection, cache) => {
  const cards = await getAllCardsFromPriceServiceDatabase(databaseConnection, cache);
  return cards[id] || null;
};

export const getAllPricesFromPriceServiceDatabase = async (
  databaseConnection,
  cache,
  options = { forceRefresh: false }
) => {
  let prices = cache.get(ALL_PRICES);
  if (prices == null || options.forceRefresh) {
    try {
      prices = await databaseConnection
        .select(
          'Card.id as cardId',
          'Price.tcgplayerId',
          'Card.name',
          'Price.low',
          'Price.average',
          'Price.high',
          'Price.market',
          'Price.foil',
          'Price.createdAt',
          'Price.updatedAt'
        )
        .from('Card')
        .leftJoin('Price', 'Price.cardId', '=', 'Card.id');
      prices = keyBy(prices, 'cardId');
      cache.set(ALL_PRICES, prices);
    } catch (error) {
      console.error(`[Error] Failed to getAllPricesFromPriceServiceDatabase: ${JSON.stringify(error)}`);
      return {};
    }
  }
  return prices;
};

export const getSpecificPriceFromPriceServiceDatabase = async (
  id,
  databaseConnection,
  cache,
  options = { forceRefresh: false }
) => {
  let prices;
  try {
    prices = await getAllPricesFromPriceServiceDatabase(databaseConnection, cache, options);
  } catch (error) {
    console.error(`[Error] Failed to getSpecificPriceFromPriceServiceDatabase: ${JSON.stringify(error)}`);
    return null;
  }
  return prices?.[id] || null;
};

export const upsertPriceIntoDatabase = async (price, databaseConnection) => {
  try {
    const currentPriceCount = (
      await databaseConnection.where({ tcgplayerId: price.tcgplayerId }).count().from('Price')
    )[0].count;
    const currentPriceExists = currentPriceCount > 0;
    const currentTime = new Date().toISOString();
    price.updatedAt = currentTime;
    if (currentPriceExists) {
      await databaseConnection('Price').where({ tcgplayerId: price.tcgplayerId }).update(price);
    } else {
      price.createdAt = currentTime;
      await databaseConnection('Price').insert(price);
    }
  } catch (error) {
    console.error(`[Error] Failed to upsertPriceIntoDatabase: ${JSON.stringify(error)}`);
  }
};

export const upsertCardIntoDatabase = async (card, databaseConnection) => {
  try {
    const currentCardCount = (await databaseConnection.where({ id: card.id }).count().from('Card'))[0].count;
    const currentPriceExists = currentCardCount > 0;
    if (currentPriceExists) {
      await databaseConnection('Card').where({ id: card.id }).update(card);
    } else {
      await databaseConnection('Card').insert(card);
    }
  } catch (error) {
    console.error(`[Error] Failed to upsertCardIntoDatabase: ${JSON.stringify(error)}`);
  }
};
