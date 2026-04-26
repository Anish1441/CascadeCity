export interface CityWeather {
  city: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  condition: string;
  heatIndex: number;
}

export const WEATHER_CITIES = [
  { city: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { city: "Pune", lat: 18.5204, lon: 73.8567 },
  { city: "Aurangabad", lat: 19.8762, lon: 75.3433 },
  { city: "Solapur", lat: 17.6868, lon: 75.9064 },
  { city: "Kolhapur", lat: 16.7050, lon: 74.2433 },
  { city: "Akola", lat: 20.7002, lon: 77.0082 },
] as const;

export function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export function calculateHeatIndex(tempC: number, humidity: number): number {
  // Simplified heat index calculation
  const t = tempC;
  const rh = humidity;
  const hi =
    -8.78469475556 +
    1.61139411 * t +
    2.338549 * rh -
    0.14611605 * t * rh -
    0.012308094 * t * t -
    0.016424828 * rh * rh +
    0.002211732 * t * t * rh +
    0.00072546 * t * rh * rh -
    0.000003582 * t * t * rh * rh;
  return Math.round(hi * 10) / 10;
}

export function getMockWeatherData(): CityWeather[] {
  return WEATHER_CITIES.map((c) => ({
    city: c.city,
    lat: c.lat,
    lon: c.lon,
    temperature: 28 + Math.random() * 12,
    humidity: 40 + Math.random() * 40,
    windSpeed: 5 + Math.random() * 20,
    precipitation: Math.random() * 5,
    weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
    condition: "Partly Cloudy",
    heatIndex: 30 + Math.random() * 15,
  }));
}

export async function fetchCityWeather(
  lat: number,
  lon: number
): Promise<Omit<CityWeather, "city"> | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    const curr = data.current;
    const temp = curr.temperature_2m;
    const humidity = curr.relative_humidity_2m;
    return {
      lat,
      lon,
      temperature: temp,
      humidity,
      windSpeed: curr.wind_speed_10m,
      precipitation: curr.precipitation,
      weatherCode: curr.weather_code,
      condition: getWeatherCondition(curr.weather_code),
      heatIndex: calculateHeatIndex(temp, humidity),
    };
  } catch {
    return null;
  }
}
