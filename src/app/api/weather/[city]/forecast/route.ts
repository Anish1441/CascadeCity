import { NextRequest, NextResponse } from "next/server";
import { fetchCityForecast } from "@/lib/weather";

export const revalidate = 3600;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city } = await params;
    const forecast = await fetchCityForecast(decodeURIComponent(city));
    return NextResponse.json(forecast, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Forecast error:", error);
    return NextResponse.json({ error: "Failed to fetch forecast" }, { status: 500 });
  }
}
