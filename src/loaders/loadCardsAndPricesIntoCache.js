import NodeCache from 'node-cache';
import knex from 'knex';
import {
  getConnectionToPriceServiceDatabase,
  getAllCardsFromPriceServiceDatabase,
  getAllPricesFromPriceServiceDatabase,
} from '../databases/priceServiceDb';

const loadCardsAndPricesIntoCache = async (app) => {
  const cache = new NodeCache({ stdTTL: 60 * 60, useClones: false });
  console.info('[Info] Loading cards and prices into in-memory cache...');
  const db = await getConnectionToPriceServiceDatabase(knex);
  await getAllCardsFromPriceServiceDatabase(db, cache);
  await getAllPricesFromPriceServiceDatabase(db, cache);
  console.info('[Info] Loading cards and prices complete.');
  app.context.db = db;
  app.context.cache = cache;
};

export default loadCardsAndPricesIntoCache;
