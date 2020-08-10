import { getSpecificCardFromPriceServiceDatabase } from '../databases/priceServiceDb';
import { getTcgplayerPricesForCard } from '../network/tcgplayer';

const getPrice = async (ctx, id) => {
  const card = await getSpecificCardFromPriceServiceDatabase(id, ctx.db, ctx.cache);
  const prices = await getTcgplayerPricesForCard(card, ctx.cache);
  ctx.body = prices;
};

export default getPrice;
