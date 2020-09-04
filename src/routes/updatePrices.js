import { updatePricesStartingFromId } from '../jobs';

const updatePrices = (ctx, startId) => {
  if (startId == null) {
    ctx.status = 400;
    ctx.body = { error: `startId is required, received: ${startId}` };
  } else {
    try {
      updatePricesStartingFromId(ctx.db, ctx.cache, startId);
      ctx.status = 200;
      ctx.body = { message: `updatePricesStartingFromId job queued from id ${startId}` };
    } catch (error) {
      ctx.status = 503;
      ctx.body = {
        error: `Unable to queue job updatePricesStartingFromId from id ${startId}: ${JSON.stringify(error)}`,
      };
    }
  }
};

export default updatePrices;
