import cliProgress from 'cli-progress';
import axios from 'axios';

const batchUpsertPrices = async (prices = []) => {
  const baseUrl = process.env.NEW_MTGCB_API_URL;
  const apiKey = process.env.NEW_MTGCB_API_PRIVATE_KEY;
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  try {
    console.info('[Info] Calling MTG CB New API to upsert all prices');

    const BATCH_SIZE = 200;
    const batches = [];
    for (let i = 0; i < prices.length; i += BATCH_SIZE) {
      batches.push(prices.slice(i, i + BATCH_SIZE));
    }

    progressBar.start(batches.length, 0);

    for (let i = 0; i < batches.length; i += 1) {
      const batch = batches[i];
      const floatKeys = ['low', 'average', 'high', 'market', 'foil'];
      batch.forEach((price) => {
        floatKeys.forEach((key) => {
          price[key] = parseFloat(price[key]);
        });
      });

      const data = {
        data: batch,
        privateKey: apiKey,
      };

      await axios.post(`${baseUrl}`, {
        query: `mutation batchUpsertPrices($data: [BatchUpsertPricesData]!, $privateKey: String!) {
          batchUpsertPrices(data: $data, privateKey: $privateKey) {
            affectedRows
            success
          }
        }`,
        variables: data,
      });
      progressBar.increment();
    }
  } catch (error) {
    delete error.config;
    console.error(`[Error] Failed to batchUpsertPrices in MTG CB New API: ${JSON.stringify(error)}`);
    return null;
  } finally {
    progressBar.stop();
  }
};

export default batchUpsertPrices;
