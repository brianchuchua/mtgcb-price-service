import axios from 'axios';
import { getTcgplayerPricesForCard } from '../../../network/tcgplayer';
import { TCGPLAYER_CARD_PRICE_PREFIX, TCGPLAYER_TOKEN } from '../../../constants/cacheKeys';

// jest.mock('../../../network/tcgplayer/getTcgplayerToken', () => ({
//   getTcgplayerToken: jest.fn(() => 'mock-token'),
// }));

jest.mock('axios', () => ({
  get: jest.fn(() => ({
    data: {
      success: true,
      errors: [],
      results: [
        {
          productId: 1025,
          lowPrice: 78.0,
          midPrice: 81.08,
          highPrice: 84.16,
          marketPrice: 51.25,
          directLowPrice: 78.0,
          subTypeName: 'Normal',
        },
        {
          productId: 1025,
          lowPrice: null,
          midPrice: null,
          highPrice: null,
          marketPrice: null,
          directLowPrice: null,
          subTypeName: 'Foil',
        },
      ],
    },
  })),
}));

describe('getTcgplayerPricesForCard', () => {
  it('returns null if tcgplayerId is missing', async () => {
    const cache = { get: jest.fn() };
    const cardMissingTcgplayerId = { id: 1 };

    const prices = await getTcgplayerPricesForCard(cardMissingTcgplayerId, cache);

    expect(prices).toBeNull();
  });

  it('returns null if card id is missing', async () => {
    const cache = { get: jest.fn() };
    const cardMissingId = { tcgplayerId: 1025 };

    const prices = await getTcgplayerPricesForCard(cardMissingId, cache);

    expect(prices).toBeNull();
  });

  it('returns null if there is an error thrown', async () => {
    const cache = {
      get: jest.fn(() => {
        throw new Error();
      }),
    };
    const card = { id: 1, tcgplayerId: 1025 };

    const prices = await getTcgplayerPricesForCard(card, cache);

    expect(prices).toBeNull();
  });

  it('retrieves the price from the cache if present', async () => {
    const cardPrices = {
      '1': [
        {
          cardId: 1,
          directLowPrice: 78,
          highPrice: 84.16,
          lowPrice: 78,
          marketPrice: 51.25,
          midPrice: 81.08,
          productId: 1025,
          subTypeName: 'Normal',
        },
        {
          cardId: 1,
          directLowPrice: null,
          highPrice: null,
          lowPrice: null,
          marketPrice: null,
          midPrice: null,
          productId: 1025,
          subTypeName: 'Foil',
        },
      ],
    };
    const cache = {
      get: jest.fn(() => cardPrices),
    };
    const card = { id: 1, tcgplayerId: 1025 };

    const prices = await getTcgplayerPricesForCard(card, cache);

    expect(prices).toStrictEqual(cardPrices);
  });

  it('retrieves the price from tcgplayer if not cached', async () => {
    const cardPrices = {
      '1': [
        {
          cardId: 1,
          directLowPrice: 78,
          highPrice: 84.16,
          lowPrice: 78,
          marketPrice: 51.25,
          midPrice: 81.08,
          productId: 1025,
          subTypeName: 'Normal',
        },
        {
          cardId: 1,
          directLowPrice: null,
          highPrice: null,
          lowPrice: null,
          marketPrice: null,
          midPrice: null,
          productId: 1025,
          subTypeName: 'Foil',
        },
      ],
    };
    const TCGPLAYER_PRICES_FOR_CARD = `${TCGPLAYER_CARD_PRICE_PREFIX}:1025`;

    const cache = {
      get: jest.fn((key) => {
        switch (key) {
          case TCGPLAYER_PRICES_FOR_CARD:
            return null;
          case TCGPLAYER_TOKEN:
            return 'mock-token';
          default:
            return null;
        }
      }),
      set: jest.fn(),
    };

    const card = { id: 1, tcgplayerId: 1025 };

    const prices = await getTcgplayerPricesForCard(card, cache);

    expect(prices).toStrictEqual(cardPrices);
    expect(axios.get).toBeCalled();
  });

  it('caches the price upon retrieval from tcgplayer', async () => {
    const TCGPLAYER_PRICES_FOR_CARD = `${TCGPLAYER_CARD_PRICE_PREFIX}:1025`;

    const cache = {
      get: jest.fn((key) => {
        switch (key) {
          case TCGPLAYER_PRICES_FOR_CARD:
            return null;
          case TCGPLAYER_TOKEN:
            return 'mock-token';
          default:
            return null;
        }
      }),
      set: jest.fn(),
    };

    const card = { id: 1, tcgplayerId: 1025 };

    await getTcgplayerPricesForCard(card, cache);

    expect(cache.set).toHaveBeenCalled();
  });
});
