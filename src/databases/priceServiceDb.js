import keyBy from 'lodash/keyBy';
import {
  ALL_CARDS,
  ALL_PRICES,
  ALL_CARDS_FROM_ID_PREFIX,
  ALL_CARDS_MISSING_TCGPLAYER_ID,
} from '../constants/cacheKeys';

export const getConnectionToPriceServiceDatabase = async (knex) => {
  try {
    const databaseConnection = await knex({
      client: 'pg',
      connection: process.env.DATABASE_URL,
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

export const getAllCardsFromPriceServiceDatabaseFromId = async (
  databaseConnection,
  cache,
  options = { startId: 1 }
) => {
  const ALL_CARDS_FROM_ID = `${ALL_CARDS_FROM_ID_PREFIX}:${options.startId}`;

  let cards = cache.get(ALL_CARDS_FROM_ID);
  try {
    cards = await databaseConnection.from('Card').where('id', '>=', options.startId);
    cards = keyBy(cards, 'id');
    cache.set(ALL_CARDS_FROM_ID, cards);
  } catch (error) {
    console.error(`[Error] Failed to getAllCardsFromPriceServiceDatabaseFromId: ${JSON.stringify(error)}`);
    return {};
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

export const getAllCardsMissingTcgplayerId = async (databaseConnection, cache) => {
  let cards = cache.get(ALL_CARDS_MISSING_TCGPLAYER_ID);
  try {
    cards = await databaseConnection.from('Card').whereNull('tcgplayerId');
    const TWELVE_HOURS = 12 * 60 * 60;
    cache.set(ALL_CARDS_MISSING_TCGPLAYER_ID, cards, TWELVE_HOURS);
  } catch (error) {
    console.error(`[Error] Failed to getAllCardsMissingTcgplayerId: ${JSON.stringify(error)}`);
    return {};
  }

  return cards;
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
    const currentCardInDatabase = await databaseConnection.where({ id: card.id }).from('Card');
    const currentCardCount = currentCardInDatabase?.length || 0;
    const cardInDatabaseAlreadyHasATcgplayerId = currentCardCount > 0 && currentCardInDatabase[0]?.tcgplayerId;

    if (cardInDatabaseAlreadyHasATcgplayerId) {
      delete card.tcgplayerId;
    }

    const currentCardExists = currentCardCount > 0;
    if (currentCardExists) {
      await databaseConnection('Card').where({ id: card.id }).update(card);
    } else {
      await databaseConnection('Card').insert(card);
    }
  } catch (error) {
    console.error(`[Error] Failed to upsertCardIntoDatabase: ${JSON.stringify(error)}`);
  }
};

export const updateTcgplayerIdInDatabase = async (card, databaseConnection) => {
  try {
    await databaseConnection('Card').where({ scryfallId: card.scryfallId, tcgplayerId: null }).update(card);
  } catch (error) {
    console.error(`[Error] Failed to updateTcgplayerId: ${JSON.stringify(error)}`);
  }
};
