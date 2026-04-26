import { NextResponse } from "next/server";
import { fetchAllCitiesWeather } from "@/lib/weather";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export async function GET() {
  try {
    const weather = await fetchAllCitiesWeather();
    return NextResponse.json(weather, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Weather GET error:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
