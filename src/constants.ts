export const RECLAIM_SUBGRAPH_URI =
  import.meta.env.VITE_RECLAIM_GRAPH_URI || "http://127.0.0.1:8000/subgraphs/name/makoto/ens-reclaim-deposit-subgraph";
export const ENS_SUBGRAPH_URI =
  import.meta.env.VITE_ENS_GRAPH_URI || "http://127.0.0.1:8000/subgraphs/name/graphprotocol/ens";
export const REGISTRAR_ADDRESS = "0x6090a6e47849629b7245dfa1ca21d94cd15878ef" as const;
export const REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
