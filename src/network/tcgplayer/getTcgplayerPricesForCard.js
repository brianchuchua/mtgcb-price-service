import axios from 'axios';
import Bottleneck from 'bottleneck';

import { tcgplayerApiVersion } from './util';
import { TCGPLAYER_CARD_PRICE_PREFIX } from '../../constants/cacheKeys';
import getTcgplayerToken from './getTcgplayerToken';

const rateLimiter = new Bottleneck({
  maxConcurrent: parseInt(process.env.TCGPLAYER_MAX_CONCURRENT_REQUESTS, 10) || 10,
  minTime: parseInt(process.env.TCGPLAYER_MIN_TIME_BETWEEN_REQUESTS_MS, 10) || 100,
});

const getTcgplayerPricesForCard = async (card, cache) => {
  const { id, tcgplayerId } = card;
  if (!tcgplayerId || !id) {
    return null;
  }
  try {
    const TCGPLAYER_PRICES_FOR_CARD = `${TCGPLAYER_CARD_PRICE_PREFIX}:${tcgplayerId}`;
    let tcgPlayerPricesForCard = cache.get(TCGPLAYER_PRICES_FOR_CARD);
    if (!tcgPlayerPricesForCard) {
      const response = await rateLimiter.schedule(async () => {
        const bearerToken = await getTcgplayerToken(cache);
        return axios.get(`http://api.tcgplayer.com/${tcgplayerApiVersion}/pricing/product/${tcgplayerId}`, {
          headers: { Authorization: `Bearer ${bearerToken}` },
        });
      });

      tcgPlayerPricesForCard = response?.data?.results ? { [id]: response?.data?.results } : null;

      if (tcgPlayerPricesForCard[id]) {
        tcgPlayerPricesForCard[id].forEach((price) => {
          price.cardId = id;
        });
      }

      const ONE_HOUR = 60 * 60;
      cache.set(TCGPLAYER_PRICES_FOR_CARD, tcgPlayerPricesForCard, ONE_HOUR);
    }
    return tcgPlayerPricesForCard;
  } catch (error) {
    console.error(
      `[Error] Failed to fetch TcgPlayer price for ${card.name} (tcgplayerId id: ${tcgplayerId}): ${JSON.stringify(
        error?.response?.data ?? error
      )}`
    );
    return null;
  }
};

export default getTcgplayerPricesForCard;
