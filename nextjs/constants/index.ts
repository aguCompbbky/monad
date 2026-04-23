import escrowArtifact from "../../hardhat/artifacts/contracts/Escrow.sol/Escrow.json";
import { Abi } from "viem";

export const ESCROW_ABI = escrowArtifact.abi as Abi;

export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ||
  "0x1111111111111111111111111111111111111111") as `0x${string}`;

export const SELLER_DISPLAY_NAMES: Record<string, string> = {
  "0xd7a9251d72a390246818cc991e3d811bd090c522": "Yunus Başkan",
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": "Yunus Başkan",
};
