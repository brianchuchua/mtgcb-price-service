import cliProgress from 'cli-progress';
import { getAllCardsFromPriceServiceDatabaseFromId, upsertPriceIntoDatabase } from '../databases/priceServiceDb';
import { getTcgplayerPricesForCard } from '../network/tcgplayer';
import { warmUpPriceCache } from './util';

const updatePricesStartingFromId = async (db, cache, startId) => {
  if (startId == null) {
    console.error(`[Error] Failed to updatePricesStartingFromId -- startId was missing`);
    return null;
  }

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  const startTime = new Date().getTime();
  console.info(`[Info] Started price update from id = ${startId} at ${new Date(startTime).toISOString()}`);

  const cards = await getAllCardsFromPriceServiceDatabaseFromId(db, cache, { startId });
  const listOfCards = Object.values(cards);
  const cardCount = listOfCards.length;
  progressBar.start(cardCount, 0);

  const pricesToFetch = [];
  for (const card of listOfCards) {
    pricesToFetch.push(
      getTcgplayerPricesForCard(card, cache).finally(() => {
        progressBar.increment();
      })
    );
  }

  const allPrices = (
    await Promise.allSettled(pricesToFetch).finally(() => {
      progressBar.stop();
    })
  )
    .filter((price) => price?.value)
    .map((price) => price?.value);

  const pricesToInsert = allPrices.map((allCardPriceEntries) => {
    const priceToInsert = {};
    for (const specificCardPriceEntries of Object.values(allCardPriceEntries)) {
      for (const priceEntry of specificCardPriceEntries) {
        if (priceEntry.subTypeName === 'Normal') {
          priceToInsert.cardId = priceEntry.cardId;
          priceToInsert.tcgplayerId = priceEntry.productId;
          priceToInsert.low = priceEntry.lowPrice;
          priceToInsert.average = priceEntry.midPrice;
          priceToInsert.high = priceEntry.highPrice;
          priceToInsert.market = priceEntry.marketPrice;
        } else if (priceEntry.subTypeName === 'Foil') {
          if (priceEntry.marketPrice) {
            priceToInsert.foil = priceEntry.marketPrice;
          } else if (priceEntry.lowPrice) {
            priceToInsert.foil = priceEntry.lowPrice;
          } else {
            priceToInsert.foil = null;
          }
        }
      }
    }
    return priceToInsert;
  });

  for (const priceToInsert of pricesToInsert) {
    await upsertPriceIntoDatabase(priceToInsert, db);
  }

  const endTime = new Date().getTime();
  const duration = (endTime - startTime) / 1000 / 60;
  console.info(
    `[Info] Ended price update from id = ${startId} at ${new Date(endTime).toISOString()}. Duration: ${duration.toFixed(
      2
    )} minutes`
  );

  await warmUpPriceCache(db, cache);
};

export default updatePricesStartingFromId;
