import { getAllCardsFromPriceServiceDatabase } from '../../databases/priceServiceDb';

const warmUpCardCache = async (db, cache) => {
  await getAllCardsFromPriceServiceDatabase(db, cache, { forceRefresh: true });
};

export default warmUpCardCache;
