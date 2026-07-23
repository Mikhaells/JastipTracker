import { NextResponse } from "next/server";
import { getExchangeRate } from "@/lib/exchange";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to") || "IDR";

  if (!from) {
    return NextResponse.json(
      { error: "Parameter 'from' harus diisi" },
      { status: 400 }
    );
  }

  try {
    const rate = await getExchangeRate(from, to);
    return NextResponse.json({ from, to, rate });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil kurs mata uang" },
      { status: 500 }
    );
  }
}
