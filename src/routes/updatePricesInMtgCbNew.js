import { updateNewMtgCbApiPrices } from '../jobs';

const updatePricesInMtgCbNew = (ctx) => {
  try {
    updateNewMtgCbApiPrices(ctx.db, ctx.cache);
    ctx.status = 200;
    ctx.body = { message: `updateNewMtgCbApiPrices job queued` };
  } catch (error) {
    ctx.status = 503;
    ctx.body = {
      error: `Unable to queue job updateNewMtgCbApiPrices: ${JSON.stringify(error)}`,
    };
  }
};

export default updatePricesInMtgCbNew;
