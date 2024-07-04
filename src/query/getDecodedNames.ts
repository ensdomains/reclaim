import type { ClientWithEns } from "@ensdomains/ensjs/contracts";
import { GraphQLClient, gql } from "graphql-request";
import type { Hex } from "viem";

export type GetDecodedNamesParameters = {
  /** unknown labels */
  labels: (Hex | "unknown")[];
};

export type GetDecodedNamesReturnType = string[];

type SubgraphResult = {
  [key: `labels${number}`]: [{ labelName: string }] | [];
};

/**
 * Gets the full name for a name with unknown labels from the subgraph.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetDecodedNameParameters}
 * @returns Full name, or null if name was could not be filled. {@link GetDecodedNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getDecodedName } from '@ensdomains/ensjs/subgraph'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getDecodedName(client, { name: '[5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da].eth' })
 * // ens.eth
 */
const getDecodedNames = async (
  client: ClientWithEns,
  { labels }: GetDecodedNamesParameters,
): Promise<GetDecodedNamesReturnType> => {
  const subgraphClient = new GraphQLClient(client.chain.subgraphs.ens.url);

  let labelsQuery = "";
  for (let i = 0; i < labels.length; i += 1) {
    const label = labels[i];
    if (label === "unknown") continue;
    labelsQuery += gql`
        labels${i}: domains(first: 1, where: { labelhash: "${label.toLowerCase()}", labelName_not: null }) {
          labelName
        }
      `;
  }

  const decodedNameQuery = gql`
    query decodedName {
      ${labelsQuery}
    }
  `;

  const labelResults = await subgraphClient.request<SubgraphResult>(decodedNameQuery);
  if (!labelResults) throw new Error("Error fetching decoded labels");

  const attemptedDecodedLabels = [...labels] as string[];

  if (Object.keys(labelResults).length !== 0) {
    for (const [key, value] of Object.entries(labelResults)) {
      if (value.length && value[0].labelName) {
        attemptedDecodedLabels[Number.parseInt(key.replace("labels", ""))] = value[0].labelName;
      }
    }
  }

  return attemptedDecodedLabels;
};

export default getDecodedNames;
