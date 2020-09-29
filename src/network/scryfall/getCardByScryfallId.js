import axios from 'axios';
import Bottleneck from 'bottleneck';

const rateLimiter = new Bottleneck({
  maxConcurrent: parseInt(process.env.SCRYFALL_MAX_CONCURRENT_REQUESTS, 10) || 10,
  minTime: parseInt(process.env.SCRYFALL_MIN_TIME_BETWEEN_REQUESTS_MS, 10) || 100,
});

const getCardByScryfallId = async (scryfallId) => {
  if (!scryfallId) {
    return null;
  }
  try {
    const response = await rateLimiter.schedule(async () => axios.get(`https://api.scryfall.com/cards/${scryfallId}`));
    return response?.data ?? null;
  } catch (error) {
    console.error(
      `[Error] Failed to fetch card from Scryfall with scryfallId ${scryfallId}: ${JSON.stringify(
        error?.response?.data ?? error
      )}`
    );
    return null;
  }
};

export default getCardByScryfallId;
