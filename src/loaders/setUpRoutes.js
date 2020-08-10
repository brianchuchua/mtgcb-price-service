import route from 'koa-route';
import { getPrice, getPrices, healthCheck } from '../routes';

const setUpRoutes = (app) => {
  app.use(route.get('/prices/:id', getPrice));
  app.use(route.get('/prices/', getPrices));
  app.use(route.get('/health/', healthCheck));
};

export default setUpRoutes;
