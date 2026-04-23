// GariEscrow kontrat ABI ve adresi.
// Deploy sonrası adresi `NEXT_PUBLIC_GARI_ESCROW_ADDRESS` env değişkenine ya da buraya gir.

export const GARI_ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_GARI_ESCROW_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const GARI_ESCROW_ABI = [
  {
    inputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "bytes32", name: "pinHash", type: "bytes32" },
    ],
    name: "lock",
    outputs: [{ internalType: "uint256", name: "orderId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "orderId", type: "uint256" },
      { internalType: "uint256", name: "pinCode", type: "uint256" },
    ],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "orderId", type: "uint256" }],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "orders",
    outputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes32", name: "pinHash", type: "bytes32" },
      { internalType: "uint64", name: "lockedAt", type: "uint64" },
      { internalType: "uint8", name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "orderId", type: "uint256" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "bytes32", name: "pinHash", type: "bytes32" },
    ],
    name: "OrderLocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "orderId", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "OrderReleased",
    type: "event",
  },
] as const;
