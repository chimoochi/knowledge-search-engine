
export const API_BASE_URL = 'https://api.biosearchengine.earth';
// Switched to a different CORS proxy to resolve "Failed to fetch" errors.
export const PROXY_URL = 'https://corsproxy.io/?';

export const fetchWithRetry = async (url: string, retries = 2, delay = 2000): Promise<Response> => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      if (attempt > retries) {
        throw new Error(`Request failed with status ${response.status} after ${retries} retries.`);
      }
      console.warn(`Attempt ${attempt} for ${url} failed. Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt > retries) {
        throw error;
      }
      console.warn(`Attempt ${attempt} for ${url} failed with error: ${error}. Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Fetch with retry failed unexpectedly.');
};
