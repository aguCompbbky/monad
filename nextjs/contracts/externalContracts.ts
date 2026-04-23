import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
  // Escrow reads/writes in this MVP are handled via wagmi + constants (`~~/constants`).
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
