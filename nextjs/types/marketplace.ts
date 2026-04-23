export type Listing = {
  id: number;
  title: string;
  features: string;
  priceWei: bigint;
  seller: `0x${string}`;
  buyer: `0x${string}`;
  status: number;
};
