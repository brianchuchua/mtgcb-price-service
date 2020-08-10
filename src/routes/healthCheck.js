import { getSpecificCardFromPriceServiceDatabase } from '../databases/priceServiceDb';

const healthCheck = async (ctx) => {
  const card = await getSpecificCardFromPriceServiceDatabase(1, ctx.db, ctx.cache);
  if (card.id === 1) {
    ctx.status = 200;
    ctx.body = { isHealthy: true };
  } else {
    ctx.status = 503;
    ctx.body = { isHealthy: false };
  }
};

export default healthCheck;
