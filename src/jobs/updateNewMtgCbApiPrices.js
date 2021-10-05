import { getAllPricesFromPriceServiceDatabaseAsArray } from '../databases/priceServiceDb';
import { batchUpsertPrices } from '../network/mtgcbNewApi';

const updateNewMtgCbApiPrices = async (db, cache) => {
  const startTime = new Date().getTime();
  console.info(`[Info] Started upserting all prices in the new MTG CB API at ${new Date(startTime).toISOString()}`);

  const prices = await getAllPricesFromPriceServiceDatabaseAsArray(db, cache);

  await batchUpsertPrices(prices);

  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000 / 60;
  console.info(
    `[Info] Ended upserting all prices in the new MTG CB API at ${new Date(
      endTime
    ).toISOString()}. Duration: ${duration.toFixed(2)} minutes`
  );
};

export default updateNewMtgCbApiPrices;
