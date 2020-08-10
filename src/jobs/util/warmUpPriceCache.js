import { getAllPricesFromPriceServiceDatabase } from '../../databases/priceServiceDb';

const warmUpPriceCache = async (db, cache) => {
  await getAllPricesFromPriceServiceDatabase(db, cache, { forceRefresh: true });
};

export default warmUpPriceCache;
