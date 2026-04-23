import { NextRequest, NextResponse } from "next/server";

// Sunucu tarafında tutulan, kargo simülasyonunda alıcıya verilecek teslimat PIN'leri.
// Bu dosya Next.js tarafından yalnızca sunucuda çalıştırılır; client bundle'ına sızmaz.
const PIN_BY_SLUG: Record<string, string> = {
  "iphone-14": "142536",
  "macbook-m2-pro": "718293",
  scooter: "406198",
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const pin = PIN_BY_SLUG[slug];
  if (!pin) {
    return NextResponse.json({ error: "unknown product" }, { status: 404 });
  }
  return NextResponse.json(
    { pin },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
