// Weather service using OpenMeteo API (free, no API key needed)
// Cache TTL: 5 minutes

import { cacheGet, cacheSet } from "./utils";

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  heatIndex: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  weatherCode: number;
  aqi?: number;
  updatedAt: string;
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  heatIndex: number;
  precipitationSum: number;
  weatherCode: number;
}

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Nagpur: { lat: 21.1458, lon: 79.0882 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Aurangabad: { lat: 19.8762, lon: 75.3433 },
  Solapur: { lat: 17.6805, lon: 75.9064 },
  Kolhapur: { lat: 16.705, lon: 74.2433 },
  Akola: { lat: 20.7002, lon: 77.0082 },
};

function calculateHeatIndex(tempC: number, humidity: number): number {
  // Steadman's heat index formula (Celsius)
  const T = tempC;
  const R = humidity;
  if (T < 27) return T;
  const HI =
    -8.78469475556 +
    1.61139411 * T +
    2.33854883889 * R +
    -0.14611605 * T * R +
    -0.012308094 * T * T +
    -0.016424828 * R * R +
    0.002211732 * T * T * R +
    0.00072546 * T * R * R +
    -0.000003582 * T * T * R * R;
  return Math.round(HI * 10) / 10;
}

export async function fetchCityWeather(city: string): Promise<WeatherData> {
  const cacheKey = `weather:${city}`;
  const cached = cacheGet<WeatherData>(cacheKey);
  if (cached) return cached;

  const coords = CITY_COORDS[city];
  if (!coords) throw new Error(`Unknown city: ${city}`);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,uv_index,weather_code&timezone=Asia/Kolkata`;

  const res = await fetch(url, { next: { revalidate: 300 } }); // 5 min ISR
  if (!res.ok) throw new Error(`OpenMeteo API error: ${res.status}`);

  const data = await res.json();
  const current = data.current;

  const temperature = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const heatIndex = calculateHeatIndex(temperature, humidity);

  // Fetch AQI from WAQI if API key available
  let aqi: number | undefined;
  try {
    aqi = await fetchAQI(coords.lat, coords.lon);
  } catch {
    // AQI optional
  }

  const weather: WeatherData = {
    city,
    temperature: Math.round(temperature * 10) / 10,
    humidity,
    heatIndex,
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
    precipitation: current.precipitation,
    uvIndex: current.uv_index,
    weatherCode: current.weather_code,
    aqi,
    updatedAt: new Date().toISOString(),
  };

  cacheSet(cacheKey, weather, 300); // Cache 5 min
  return weather;
}

export async function fetchAllCitiesWeather(): Promise<WeatherData[]> {
  const cities = Object.keys(CITY_COORDS);
  const results = await Promise.allSettled(cities.map((c) => fetchCityWeather(c)));
  return results
    .filter((r): r is PromiseFulfilledResult<WeatherData> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function fetchCityForecast(city: string): Promise<ForecastDay[]> {
  const cacheKey = `forecast:${city}`;
  const cached = cacheGet<ForecastDay[]>(cacheKey);
  if (cached) return cached;

  const coords = CITY_COORDS[city];
  if (!coords) throw new Error(`Unknown city: ${city}`);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia/Kolkata&forecast_days=7`;

  const res = await fetch(url, { next: { revalidate: 3600 } }); // 1 hr ISR
  if (!res.ok) throw new Error(`OpenMeteo API error: ${res.status}`);

  const data = await res.json();
  const daily = data.daily;

  const forecast: ForecastDay[] = daily.time.map((date: string, i: number) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    heatIndex: calculateHeatIndex(daily.temperature_2m_max[i], 50),
    precipitationSum: daily.precipitation_sum[i],
    weatherCode: daily.weather_code[i],
  }));

  cacheSet(cacheKey, forecast, 3600);
  return forecast;
}

async function fetchAQI(lat: number, lon: number): Promise<number> {
  const apiKey = process.env.WAQI_API_KEY || "demo";
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return 0;
  const data = await res.json();
  return data?.data?.aqi || 0;
}
