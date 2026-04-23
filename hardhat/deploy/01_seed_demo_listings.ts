import { writeFileSync, readFileSync, mkdirSync } from "fs";
import path from "path";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther } from "viem";

const MONADDB_DIR = path.join(__dirname, "../../nextjs/.monaddb");
const MONADDB_FILE = path.join(MONADDB_DIR, "products.json");

const DEMO_LISTINGS = [
  {
    title: "iPhone 15 Pro Max",
    features: "256GB, Titanyum Siyah, kutulu, az kullanılmış, hiç çizik yok",
    priceMon: "0.05",
    pin: "147258",
  },
  {
    title: "MacBook Air M2",
    features: "8GB RAM, 256GB SSD, Uzay Grisi, orijinal kutusu ve şarj adaptörü mevcut",
    priceMon: "0.08",
    pin: "369147",
  },
  {
    title: "Sony WH-1000XM5",
    features: "Gürültü Önleyici Kulaklık, siyah renk, kutulu, aksesuarlar tamam",
    priceMon: "0.02",
    pin: "852963",
  },
  {
    title: "iPad Pro 12.9\" M2",
    features: "128GB WiFi, Uzay Grisi, Apple Pencil 2. nesil dahil",
    priceMon: "0.06",
    pin: "741852",
  },
];

const seedMonadDb = (listings: { listingId: number; title: string; features: string; pin: string }[]) => {
  mkdirSync(MONADDB_DIR, { recursive: true });

  let existing: Record<number, object> = {};
  try {
    const raw = readFileSync(MONADDB_FILE, "utf8");
    existing = JSON.parse(raw) as Record<number, object>;
  } catch {
    existing = {};
  }

  for (const l of listings) {
    existing[l.listingId] = {
      title: l.title,
      features: l.features,
      createdAt: Date.now(),
      pin: l.pin,
    };
  }

  writeFileSync(MONADDB_FILE, JSON.stringify(existing, null, 2), "utf8");
  console.log(`✅ MonadDB güncellendi: ${MONADDB_FILE}`);
};

const seedDemoListings: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const escrow = (await hre.ethers.getContract("Escrow", deployer)) as any;
  const startCount = Number(await escrow.listingCount());

  console.log(`\n🌱 Demo ilanları oluşturuluyor (mevcut ilan sayısı: ${startCount})...`);
  console.log(`   Satıcı adresi: ${deployer}\n`);

  const createdListings: { listingId: number; title: string; features: string; pin: string }[] = [];

  for (const demo of DEMO_LISTINGS) {
    const priceWei = parseEther(demo.priceMon);
    const depositWei = priceWei / 100n;
    const gas = await escrow.createListing.estimateGas(priceWei, BigInt(demo.pin), { value: depositWei });

    const tx = await escrow.createListing(priceWei, BigInt(demo.pin), {
      value: depositWei,
      gasLimit: (gas * 120n) / 100n,
    });
    await tx.wait();

    const listingId = startCount + createdListings.length + 1;
    createdListings.push({ listingId, title: demo.title, features: demo.features, pin: demo.pin });

    console.log(`   ✓ [#${listingId}] ${demo.title} — ${demo.priceMon} MON — PIN: ${demo.pin}`);
  }

  seedMonadDb(createdListings);

  console.log(`\n🎉 ${createdListings.length} demo ilan başarıyla oluşturuldu!`);
  console.log(`   Satıcı adresini "${deployer}" olarak kaydedin.\n`);
};

export default seedDemoListings;
seedDemoListings.tags = ["SeedDemo"];
seedDemoListings.dependencies = ["Escrow"];
