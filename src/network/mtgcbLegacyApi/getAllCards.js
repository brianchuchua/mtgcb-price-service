import axios from 'axios';

const getAllCards = async () => {
  const baseUrl = process.env.LEGACY_MTGCB_API_URL;
  const apiKey = process.env.LEGACY_MTGCB_API_PUBLIC_KEY;
  try {
    console.info('[Info] Fetching all cards from MTG CB - Old');
    const response = await axios.get(`${baseUrl}/cards/all?key=${apiKey}`);
    const cards = response?.data;
    return cards;
  } catch (error) {
    console.error(`[Error] Failed to getAllCards: ${JSON.stringify(error)}`);
    return null;
  }
};

export default getAllCards;
