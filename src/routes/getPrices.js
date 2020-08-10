import { getAllPricesFromPriceServiceDatabase } from '../databases/priceServiceDb';

const getPrices = async (ctx) => {
  const prices = await getAllPricesFromPriceServiceDatabase(ctx.db, ctx.cache);
  ctx.body = prices;
};

export default getPrices;
