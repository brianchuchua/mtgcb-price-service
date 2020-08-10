import bearerTokenAuth from '../../middleware/bearerTokenAuth';

describe('bearerTokenAuth', () => {
  it('returns a 401 if the auth header is missing', async () => {
    const ctx = { set: jest.fn() };
    const next = jest.fn();

    await bearerTokenAuth(ctx, next);

    expect(ctx.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns a 401 if there is no valid bearer token', async () => {
    const ctx = { headers: { authorization: 'Bearer Nicol-Bolas' }, set: jest.fn() };
    const next = jest.fn();

    await bearerTokenAuth(ctx, next);

    expect(ctx.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('proceeds through the middleware chain with correct bearer token', async () => {
    const ctx = { headers: { authorization: `Bearer ${process.env.AUTH_TOKEN}` }, set: jest.fn() };
    const next = jest.fn();

    await bearerTokenAuth(ctx, next);

    expect(ctx?.status).not.toBe(401);
    expect(next).toHaveBeenCalled();
  });
});
