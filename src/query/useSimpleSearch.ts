import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { type Address, isAddress } from "viem";
import { useChainId, useConfig } from "wagmi";

import { getName } from "@ensdomains/ensjs/public";
import { normalise } from "@ensdomains/ensjs/utils";

import { getEnsAddress } from "viem/actions";
import type { ClientWithEns } from "../wagmi";
import useDebouncedCallback from "./useDebouncedCallback";

type Options = { cache?: boolean };

type QueryByNameParams = {
  name: string;
};

type QueryByNameReturnType = {
  name: string;
  is2ldEth: boolean;
  address: Address | null;
};

type QueryByAddressReturnType = {
  name: string | null;
  is2ldEth: boolean;
  address: Address;
};

type Result = QueryByNameReturnType | QueryByAddressReturnType | null;

const getIs2ldEth = (name: string) => {
  const labels = name.split(".");
  return labels.length === 2 && labels[1] === "eth";
};

const queryByName = async (
  client: ClientWithEns,
  { name }: QueryByNameParams,
): Promise<QueryByNameReturnType | null> => {
  try {
    const normalisedName = normalise(name);
    const is2ldEth = getIs2ldEth(normalisedName);

    const address = await getEnsAddress(client, { name: normalisedName });
    if (!address)
      return {
        name: normalisedName,
        is2ldEth,
        address: null,
      };
    return {
      name: normalisedName,
      is2ldEth,
      address,
    };
  } catch {
    return null;
  }
};

type QueryByAddressParams = { address: Address };

const queryByAddress = async (
  client: ClientWithEns,
  { address }: QueryByAddressParams,
): Promise<QueryByAddressReturnType | null> => {
  try {
    const name = await getName(client, { address });
    const is2ldEth = getIs2ldEth(name?.name ?? "");

    return {
      name: name?.name ?? null,
      is2ldEth,
      address,
    };
  } catch {
    return null;
  }
};

const createQueryKeyWithChain = (chainId: number) => (query: string) => ["simpleSearch", chainId, query];

export const useSimpleSearch = (options: Options = {}) => {
  const cache = options.cache ?? true;

  const queryClient = useQueryClient();
  const chainId = useChainId();
  const createQueryKey = createQueryKeyWithChain(chainId);
  const config = useConfig();

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["simpleSearch"], exact: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutate, isPending, ...rest } = useMutation({
    mutationFn: async (query: string) => {
      if (query.length < 3) throw new Error("Query too short");
      if (cache) {
        const cachedData = queryClient.getQueryData<Result>(createQueryKey(query));
        if (cachedData) return cachedData;
      }
      const client = config.getClient({ chainId });

      if (isAddress(query)) {
        const data = await queryByAddress(client, { address: query });
        return data;
      }

      const data = await queryByName(client, { name: query });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(createQueryKey(variables), data);
    },
  });
  const debouncedMutate = useDebouncedCallback(mutate, 500);

  return {
    ...rest,
    mutate: debouncedMutate,
    isLoading: isPending || !chainId,
  };
};
