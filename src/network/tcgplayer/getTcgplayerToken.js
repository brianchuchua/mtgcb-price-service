import axios from 'axios';
import Bottleneck from 'bottleneck';
import { TCGPLAYER_TOKEN } from '../../constants/cacheKeys';

const rateLimiter = new Bottleneck({
  maxConcurrent: parseInt(process.env.TCGPLAYER_MAX_CONCURRENT_REQUESTS, 10) || 10,
  minTime: parseInt(process.env.TCGPLAYER_MIN_TIME_BETWEEN_REQUESTS_MS, 10) || 100,
});

const getTcgplayerToken = async (cache) => {
  try {
    let tcgplayerToken = cache.get(TCGPLAYER_TOKEN);
    if (!tcgplayerToken) {
      const response = await rateLimiter.schedule(async () =>
        axios.post(
          'https://api.tcgplayer.com/token',
          `grant_type=client_credentials&client_id=${process.env.TCGPLAYER_PUBLIC_ID}&client_secret=${process.env.TCGPLAYER_PRIVATE_ID}`
        )
      );

      tcgplayerToken = response.data.access_token;
      const THIRTEEN_DAYS = 13 * 24 * 60 * 60;
      cache.set(TCGPLAYER_TOKEN, tcgplayerToken, THIRTEEN_DAYS);
    }
    return tcgplayerToken;
  } catch (error) {
    console.error(`[Error] Failed to get TcgPlayer token: ${JSON.stringify(error?.response?.data ?? error)}`);
    return null;
  }
};

export default getTcgplayerToken;
