import { type CheckedChainWithEns, addresses } from "@ensdomains/ensjs/contracts";
import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { ENS_SUBGRAPH_URI, MAINNET_RPC_URL } from "./constants";

const subgraphs = {
  1: {
    ens: {
      url: ENS_SUBGRAPH_URI,
    },
  },
};

const mainnetWithEns = {
  ...mainnet,
  contracts: {
    ...mainnet.contracts,
    ...addresses[1],
  },
  subgraphs: {
    ...subgraphs[1],
  },
} as CheckedChainWithEns<typeof mainnet>;

export const config = createConfig({
  chains: [mainnetWithEns],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(MAINNET_RPC_URL),
  },
});

export type ClientWithEns = ReturnType<typeof config.getClient>;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
