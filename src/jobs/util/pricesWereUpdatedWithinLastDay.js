import moment from 'moment';
import getTimePricesWereLastUpdated from './getTimePricesWereLastUpdated';

const pricesWereUpdatedWithinLastDay = async (db, cache) => {
  const currentTime = new Date().toISOString();
  const timePricesWereLastUpdated = await getTimePricesWereLastUpdated(db, cache);
  const pricesUpdatedWithinTheLastDay = timePricesWereLastUpdated
    ? moment(currentTime).diff(timePricesWereLastUpdated, 'hours') < 24
    : true; // If we can't tell when prices were updated, assume it was recent and skip updates
  return pricesUpdatedWithinTheLastDay;
};

export default pricesWereUpdatedWithinLastDay;
