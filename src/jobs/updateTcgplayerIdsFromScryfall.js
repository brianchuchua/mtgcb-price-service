import cliProgress from 'cli-progress';
import { getAllCardsMissingTcgplayerId, updateTcgplayerIdInDatabase } from '../databases/priceServiceDb';
import { getCardByScryfallId } from '../network/scryfall';
import { warmUpCardCache } from './util';

const updateTcgplayerIdsFromScryfall = async (db, cache) => {
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  const startTime = new Date().getTime();
  console.info(`[Info] Started fetching tcgplayerIds at ${new Date(startTime).toISOString()}`);

  const cardsMissingTcgplayerId = await getAllCardsMissingTcgplayerId(db, cache);
  progressBar.start(cardsMissingTcgplayerId.length, 0);

  const cardsToFetch = [];
  for (const card of cardsMissingTcgplayerId) {
    cardsToFetch.push(
      getCardByScryfallId(card.scryfallId).finally(() => {
        progressBar.increment();
      })
    );
  }

  const fetchedCardsWithTcgplayerIds = (
    await Promise.allSettled(cardsToFetch).finally(() => {
      progressBar.stop();
    })
  )
    .filter((card) => card?.value?.tcgplayer_id) // eslint-disable-line camelcase
    .map((card) => ({ scryfallId: card.value.id, tcgplayerId: card.value.tcgplayer_id }));

  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000 / 60;
  console.info(
    `[Info] Ended fetching tcgplayerIds at ${new Date(endTime).toISOString()}. Duration: ${duration.toFixed(2)} minutes`
  );

  const progressBarForUpdates = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  const startTimeForUpdates = new Date().getTime();

  console.info(`[Info] Started updating tcgplayerIds at ${new Date(startTime).toISOString()}`);

  progressBarForUpdates.start(fetchedCardsWithTcgplayerIds.length, 0);

  for (const card of fetchedCardsWithTcgplayerIds) {
    await updateTcgplayerIdInDatabase(card, db).finally(() => {
      progressBarForUpdates.increment();
    });
  }

  progressBarForUpdates.stop();
  const endTimeForUpdates = new Date().getTime();
  const durationForUpdates = (endTimeForUpdates - startTimeForUpdates) / 1000 / 60;
  console.info(
    `[Info] Ended updating tcgplayerIds at ${new Date(
      endTimeForUpdates
    ).toISOString()}. Duration: ${durationForUpdates.toFixed(2)} minutes`
  );

  await warmUpCardCache(db, cache);
};

export default updateTcgplayerIdsFromScryfall;
