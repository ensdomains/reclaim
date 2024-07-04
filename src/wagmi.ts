import { type CheckedChainWithEns, addresses } from "@ensdomains/ensjs/contracts";
import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const ENS_SUBGRAPH_API_KEY = "9ad5cff64d93ed2c33d1a57b3ec03ea9";

const subgraphs = {
  1: {
    ens: {
      url: `https://gateway-arbitrum.network.thegraph.com/api/${ENS_SUBGRAPH_API_KEY}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`,
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
    [mainnet.id]: http(),
  },
});

export type ClientWithEns = ReturnType<typeof config.getClient>;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
