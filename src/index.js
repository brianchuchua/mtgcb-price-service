import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Koa from 'koa';
import cron from 'node-cron';
import bearerTokenAuth from './middleware/bearerTokenAuth';
import { loadCardsAndPricesIntoCache, setUpRoutes } from './loaders';
import { updateAllPrices, updateAllCardsLegacy } from './jobs';
import { ONCE_A_DAY_AT_MIDNIGHT_PACIFIC_TIME } from './constants/cron';

const MtgCbPriceService = new Koa();

(async () => {
  MtgCbPriceService.use(bearerTokenAuth);

  await loadCardsAndPricesIntoCache(MtgCbPriceService);

  setUpRoutes(MtgCbPriceService);

  const port = process.env.PORT || 3000;
  MtgCbPriceService.listen(port);
  console.info(`[Info] MTG CB Price Service is now running on port ${port}`);

  cron.schedule(ONCE_A_DAY_AT_MIDNIGHT_PACIFIC_TIME, async () => {
    await updateAllCardsLegacy(MtgCbPriceService.context.db, MtgCbPriceService.context.cache);
    await updateAllPrices(MtgCbPriceService.context.db, MtgCbPriceService.context.cache);
  });

  await updateAllCardsLegacy(MtgCbPriceService.context.db, MtgCbPriceService.context.cache);
  await updateAllPrices(MtgCbPriceService.context.db, MtgCbPriceService.context.cache);
})();

export default MtgCbPriceService;
