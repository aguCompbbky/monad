import escrowArtifact from "../../hardhat/artifacts/contracts/Escrow.sol/Escrow.json";
import { Abi } from "viem";

export const ESCROW_ABI = escrowArtifact.abi as Abi;

export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ||
  "0x1111111111111111111111111111111111111111") as `0x${string}`;
