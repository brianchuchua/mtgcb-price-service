import { updateAllCardsLegacy } from '../jobs';

const updateAllCardsFromLegacy = (ctx) => {
  try {
    updateAllCardsLegacy(ctx.db, ctx.cache);
    ctx.status = 200;
    ctx.body = { message: `updateAllCardsLegacy job queued` };
  } catch (error) {
    ctx.status = 503;
    ctx.body = {
      error: `Unable to queue job updateAllCardsLegacy: ${JSON.stringify(error)}`,
    };
  }
};

export default updateAllCardsFromLegacy;
