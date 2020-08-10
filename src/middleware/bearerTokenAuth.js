const bearerTokenAuth = async (ctx, next) => {
  const authorizationHeader = ctx?.headers?.authorization;
  const userIsUnauthorized = !authorizationHeader || ctx?.headers?.authorization !== `Bearer ${process.env.AUTH_TOKEN}`;
  if (userIsUnauthorized) {
    console.warn(`[Warning] Received unauthorized request with Authorization header: ${authorizationHeader}`);
    ctx.status = 401;
    ctx.set('Content-Type', 'application/json');
    ctx.body = JSON.stringify({
      code: 401,
      error: `Unauthorized`,
    });
  } else {
    await next();
  }
};

export default bearerTokenAuth;
