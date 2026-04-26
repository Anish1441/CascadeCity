import { NextRequest, NextResponse } from "next/server";
import { fetchCityWeather } from "@/lib/weather";

export const revalidate = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city } = await params;
    const decodedCity = decodeURIComponent(city);
    const weather = await fetchCityWeather(decodedCity);
    return NextResponse.json(weather, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("City weather error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
