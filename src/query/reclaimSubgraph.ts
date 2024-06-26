import { encodeLabelhash } from "@ensdomains/ensjs/utils";
import type { QueryFunctionContext } from "@tanstack/react-query";
import { GraphQLClient, gql } from "graphql-request";
import { type Address, type Hex, isHash } from "viem";
import { RECLAIM_SUBGRAPH_URI } from "../constants";
import type { ClientWithEns } from "../wagmi";
import getDecodedNames from "./getDecodedNames";

const reclaimSubgraph = new GraphQLClient(RECLAIM_SUBGRAPH_URI);

export const getDeedStatsQueryFn = async () =>
  reclaimSubgraph
    .request<{
      statsEntity: {
        id: string;
        numOfDeeds: number;
        currentValue: string;
        accumValue: string;
      };
    }>(gql`
      query {
        statsEntity(id: "") {
          id
          numOfDeeds
          currentValue
          accumValue
        }
      }
    `)
    .then(({ statsEntity }) => {
      if (!statsEntity) throw new Error("No stats found");

      return {
        id: statsEntity.id,
        numOfDeeds: statsEntity.numOfDeeds,
        currentValue: BigInt(statsEntity.currentValue),
        accumValue: BigInt(statsEntity.accumValue),
      };
    });

type GetDeedsForAccountQueryKey = [{ address?: Address | null }, "getDeedsForAccount"];

export const getDeedsForAccountQueryFn =
  (client: ClientWithEns) =>
  async ({ queryKey: [{ address }] }: QueryFunctionContext<GetDeedsForAccountQueryKey>) => {
    if (!address) throw new Error("address is required");

    const { account } = await reclaimSubgraph.request<
      {
        account?: {
          id: string;
          deeds: { id: Hex; value: string; name: { id: Hex } | null }[];
        };
      },
      { address: Address }
    >(
      gql`
        query getAccounts($address: String!) {
          account(id: $address) {
            id
            deeds(first: 500) {
              id
              value
              name {
                id
              }
            }
          }
        }
      `,
      { address: address.toLowerCase() as Address },
    );

    if (!account) return null;
    if (!account.deeds) return null;

    const labelhashes = account.deeds.map(({ name: nameEntity }) => (nameEntity?.id ? nameEntity.id : "unknown"));

    const decodedLabels = await getDecodedNames(client, {
      labels: labelhashes,
    });

    const decodedDeeds = account.deeds.map(({ id, value }, i) => ({
      id,
      value: BigInt(value),
      name: isHash(decodedLabels[i]) ? encodeLabelhash(decodedLabels[i]) : decodedLabels[i],
    }));

    return {
      id: account.id,
      deeds: decodedDeeds.filter((x) => x.value > 0n),
      sum: decodedDeeds.reduce((acc, { value }) => acc + value, BigInt(0)),
    };
  };
