import { NextRequest, NextResponse } from "next/server";
import { encodePacked, keccak256 } from "viem";

// Sunucu tarafında tutulan teslimat PIN'leri.
// Bu dosya sadece Next.js sunucusunda çalışır; client bundle'ına sızmaz.
// PIN'ler /api/cargo/pin endpoint'i ile serve ediliyor; burada sadece kontratın
// bekleyeceği keccak256(abi.encodePacked(uint256)) hash'ini hesaplayıp dönüyoruz.
const PIN_BY_SLUG: Record<string, string> = {
  "iphone-14": "142536",
  "macbook-m2-pro": "718293",
  scooter: "406198",
};

const toPinHash = (pin: string): `0x${string}` => {
  const asUint = BigInt(pin);
  return keccak256(encodePacked(["uint256"], [asUint]));
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const pin = PIN_BY_SLUG[slug];
  if (!pin) {
    return NextResponse.json({ error: "unknown product" }, { status: 404 });
  }
  return NextResponse.json(
    { pinHash: toPinHash(pin) },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
