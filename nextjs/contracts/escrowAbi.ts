// Extracted from hardhat/artifacts/contracts/Escrow.sol/Escrow.json for frontend usage.
export const escrowAbi = [
  {
    type: "function",
    name: "createListing",
    stateMutability: "payable",
    inputs: [
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "pinCode", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "listingId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "buyItem",
    stateMutability: "payable",
    inputs: [{ name: "listingId", type: "uint256", internalType: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "confirmDelivery",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "uint256", internalType: "uint256" },
      { name: "pinCode", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "listingCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "listings",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "seller", type: "address", internalType: "address" },
      { name: "buyer", type: "address", internalType: "address" },
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "deposit", type: "uint256", internalType: "uint256" },
      { name: "pinHash", type: "bytes32", internalType: "bytes32" },
      { name: "status", type: "uint8", internalType: "enum Escrow.ListingStatus" },
    ],
  },
] as const;
