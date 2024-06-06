import { type CheckedChainWithEns, addresses, subgraphs } from "@ensdomains/ensjs/contracts";
import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

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
    [mainnet.id]: http(),
  },
});

export type ClientWithEns = ReturnType<typeof config.getClient>;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
