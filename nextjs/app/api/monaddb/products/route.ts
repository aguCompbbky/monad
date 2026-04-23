import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DB_DIR = path.join(process.cwd(), ".monaddb");
const DB_FILE = path.join(DB_DIR, "products.json");

type MonadDbProduct = {
  title: string;
  features: string;
  createdAt: number;
};

type MonadDbProducts = Record<number, MonadDbProduct>;

const ensureDbFile = async () => {
  await mkdir(DB_DIR, { recursive: true });
  try {
    await readFile(DB_FILE, "utf8");
  } catch {
    await writeFile(DB_FILE, JSON.stringify({}), "utf8");
  }
};

const readProducts = async (): Promise<MonadDbProducts> => {
  await ensureDbFile();
  const raw = await readFile(DB_FILE, "utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw) as MonadDbProducts;
};

const writeProducts = async (products: MonadDbProducts) => {
  await ensureDbFile();
  await writeFile(DB_FILE, JSON.stringify(products, null, 2), "utf8");
};

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json({ products }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "MonadDB read error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      listingId?: number;
      title?: string;
      features?: string;
    };
    if (!body.listingId || !body.title?.trim()) {
      return NextResponse.json({ error: "listingId and title required" }, { status: 400 });
    }

    const products = await readProducts();
    products[body.listingId] = {
      title: body.title.trim(),
      features: (body.features || "").trim(),
      createdAt: Date.now(),
    };
    await writeProducts(products);

    return NextResponse.json({ products }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "MonadDB write error" }, { status: 500 });
  }
}
