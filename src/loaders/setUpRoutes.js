import route from 'koa-route';
import { getPrice, getPrices, healthCheck, updatePrices } from '../routes';

const setUpRoutes = (app) => {
  app.use(route.get('/prices/:id', getPrice));
  app.use(route.get('/prices/', getPrices));
  app.use(route.get('/health/', healthCheck));
  app.use(route.post('/jobs/prices/:startId', updatePrices));
};

export default setUpRoutes;
