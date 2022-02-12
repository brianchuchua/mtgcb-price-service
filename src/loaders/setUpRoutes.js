import route from 'koa-route';
import {
  getPrice,
  getPrices,
  healthCheck,
  updatePrices,
  updateAllCardsFromLegacy,
  updatePricesInMtgCbNew,
} from '../routes';

const setUpRoutes = (app) => {
  app.use(route.get('/prices/:id', getPrice));
  app.use(route.get('/prices/', getPrices));
  app.use(route.get('/health/', healthCheck));
  app.use(route.post('/jobs/prices/:startId', updatePrices));
  app.use(route.post('/jobs/cards/updateAllCardsFromLegacy', updateAllCardsFromLegacy));
  app.use(route.post('/jobs/prices/updatePricesInMtgCbNew', updatePricesInMtgCbNew));
};

export default setUpRoutes;
