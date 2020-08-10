import getTcgplayerToken from '../../../network/tcgplayer/getTcgplayerToken';

jest.mock('axios', () => ({
  post: jest.fn(() => ({
    data: {
      access_token: 'tcgplayer-token',
    },
  })),
}));

describe('getTcgplayertoken', () => {
  it('retrieves the cached token if present', async () => {
    const cache = { get: jest.fn(() => 'cached-token') };

    const token = await getTcgplayerToken(cache);

    expect(token).toBe('cached-token');
  });

  it('fetches the token if not cached', async () => {
    const cache = { get: jest.fn(), set: jest.fn() };

    const token = await getTcgplayerToken(cache);

    expect(token).toBe('tcgplayer-token');
  });

  it('returns null if it throws an error', async () => {
    const cache = {
      get: jest.fn(() => {
        throw new Error();
      }),
      set: jest.fn(),
    };

    const token = await getTcgplayerToken(cache);

    expect(token).toBeNull();
  });
});
