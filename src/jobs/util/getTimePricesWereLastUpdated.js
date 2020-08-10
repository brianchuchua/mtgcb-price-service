import { getSpecificPriceFromPriceServiceDatabase } from '../../databases/priceServiceDb';

const getTimePricesWereLastUpdated = async (db, cache) => {
  const FIRST_CARD_ID = 1;
  const firstPriceInDB = await getSpecificPriceFromPriceServiceDatabase(FIRST_CARD_ID, db, cache);
  return firstPriceInDB?.updatedAt || null;
};

export default getTimePricesWereLastUpdated;
