import { RadioStation } from '../types';

const BASE_URL = 'https://de1.api.radio-browser.info/json/stations';

export const fetchStationsByCountry = async (countryCode: string): Promise<RadioStation[]> => {
  try {
    // Fetch top 50 voted stations for the country, HTTPS only to avoid mixed content issues
    const response = await fetch(
      `${BASE_URL}/bycountrycodeexact/${countryCode}?limit=50&order=votes&reverse=true&hidebroken=true`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch stations');
    }
    const data = await response.json();
    // Filter out stations that don't have a resolved URL or are not playable in browser generally
    return data.filter((station: RadioStation) => station.url_resolved && station.url_resolved.startsWith('http'));
  } catch (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
};
