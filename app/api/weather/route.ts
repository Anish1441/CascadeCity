import { NextResponse } from "next/server";
import { WEATHER_CITIES, fetchCityWeather, getMockWeatherData, calculateHeatIndex, getWeatherCondition } from "@/lib/weather";

export async function GET() {
  try {
    const results = await Promise.all(
      WEATHER_CITIES.map(async (c) => {
        const data = await fetchCityWeather(c.lat, c.lon);
        if (data) {
          return { city: c.city, ...data };
        }
        // fallback mock
        const temp = 28 + Math.random() * 12;
        const humidity = 40 + Math.random() * 40;
        return {
          city: c.city,
          lat: c.lat,
          lon: c.lon,
          temperature: Math.round(temp * 10) / 10,
          humidity: Math.round(humidity),
          windSpeed: Math.round((5 + Math.random() * 20) * 10) / 10,
          precipitation: Math.round(Math.random() * 5 * 10) / 10,
          weatherCode: 1,
          condition: getWeatherCondition(1),
          heatIndex: calculateHeatIndex(temp, humidity),
        };
      })
    );
    return NextResponse.json({ data: results, cached: false, fetchedAt: new Date().toISOString() });
  } catch {
    const mock = getMockWeatherData();
    return NextResponse.json({ data: mock, cached: true, fetchedAt: new Date().toISOString() });
  }
}
