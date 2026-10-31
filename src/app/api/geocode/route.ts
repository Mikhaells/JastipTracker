import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface NominatimPlace {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  address?: Record<string, string>;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const reverse = searchParams.get("reverse") === "1";

  if (reverse) {
    const latitude = Number(searchParams.get("lat"));
    const longitude = Number(searchParams.get("lon"));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Koordinat tidak valid" }, { status: 400 });
    }

    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        format: "jsonv2",
        addressdetails: "1",
        "accept-language": "id",
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            "User-Agent": "JastipTracker/1.0 (trip route planner)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (!res.ok) {
        return NextResponse.json({ name: null });
      }

      const data = (await res.json()) as NominatimPlace;
      const address = data.address ?? {};
      const name =
        data.name ||
        address.shop ||
        address.amenity ||
        address.tourism ||
        address.leisure ||
        address.building ||
        address.road ||
        address.neighbourhood ||
        address.suburb ||
        address.village ||
        address.town ||
        address.city ||
        data.display_name?.split(",")[0]?.trim() ||
        null;

      return NextResponse.json({
        name,
        displayName: data.display_name ?? null,
        latitude: Number(data.lat ?? latitude),
        longitude: Number(data.lon ?? longitude),
      });
    } catch {
      return NextResponse.json({ name: null });
    }
  }

  if (query.length < 3) {
    return NextResponse.json([]);
  }

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "6",
    addressdetails: "1",
    "accept-language": "id",
  });

  if (/^[a-z]{2}$/i.test(country)) {
    params.set("countrycodes", country.toLowerCase());
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "JastipTracker/1.0 (trip route planner)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = (await res.json()) as NominatimPlace[];

    return NextResponse.json(
      data.map((place) => ({
        id: String(place.place_id),
        name: place.name || place.display_name.split(",")[0].trim(),
        displayName: place.display_name,
        latitude: Number(place.lat),
        longitude: Number(place.lon),
        type: place.type ?? null,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
