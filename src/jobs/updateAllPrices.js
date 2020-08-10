import cliProgress from 'cli-progress';
import { getAllCardsFromPriceServiceDatabase, upsertPriceIntoDatabase } from '../databases/priceServiceDb';
import { getTcgplayerPricesForCard } from '../network/tcgplayer';
import { pricesWereUpdatedWithinLastDay, warmUpPriceCache } from './util';

const updateAllPrices = async (db, cache) => {
  const pricesShouldNotBeUpdated = await pricesWereUpdatedWithinLastDay(db, cache);
  if (pricesShouldNotBeUpdated) {
    console.info(`[Info] Skipped price updating -- they've been updated within the last 24 hours already.`);
    return null;
  }

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  const startTime = new Date().getTime();
  console.info(`[Info] Started price update at ${new Date(startTime).toISOString()}`);

  const cards = await getAllCardsFromPriceServiceDatabase(db, cache);
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
    `[Info] Ended price update at ${new Date(endTime).toISOString()}. Duration: ${duration.toFixed(2)} minutes`
  );

  await warmUpPriceCache(db, cache);
};

export default updateAllPrices;
