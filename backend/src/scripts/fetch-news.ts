import 'dotenv/config';
import { fetchAndStoreNews } from '../services/newsService.js';

async function main() {
  try {
    console.log('Fetching news from RSS...');
    const result = await fetchAndStoreNews();
    console.log(result.message);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
