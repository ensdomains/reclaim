export const registrarAbi = [
  {
    inputs: [
      {
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "releaseDeed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "entries",
    outputs: [
      {
        name: "bid",
        type: "uint8",
      },
      {
        name: "deedAddress",
        type: "address",
      },
      {
        name: "registrationDate",
        type: "uint256",
      },
      {
        name: "value",
        type: "uint256",
      },
      {
        name: "highestBid",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
