import cliProgress from 'cli-progress';
import { upsertCardIntoDatabase } from '../databases/priceServiceDb';
import { warmUpCardCache } from './util';
import { getAllCards } from '../network/mtgcbLegacyApi';

const updateAllCardsLegacy = async (db, cache) => {
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  const startTime = new Date().getTime();
  console.info(`[Info] Started updating all cards (legacy) at ${new Date(startTime).toISOString()}`);

  const cards = await getAllCards(db, cache);
  progressBar.start(cards.length, 0);

  for (const card of cards) {
    await upsertCardIntoDatabase(card, db).finally(() => {
      progressBar.increment();
    });
  }

  progressBar.stop();
  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000 / 60;
  console.info(
    `[Info] Ended updating all cards at ${new Date(endTime).toISOString()}. Duration: ${duration.toFixed(2)} minutes`
  );

  await warmUpCardCache(db, cache);
};

export default updateAllCardsLegacy;
