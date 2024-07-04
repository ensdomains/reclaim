import type { QueryFunctionContext } from "@tanstack/react-query";
import { labelhash, zeroAddress } from "viem";
import { readContract } from "viem/actions";
import { deedAbi } from "../abis/deed";
import { registrarAbi } from "../abis/registrar";
import { REGISTRAR_ADDRESS } from "../constants";
import type { ClientWithEns } from "../wagmi";

type LookupDeedQueryKey = [{ name?: string | null }, "lookupDeed"];

export const lookupDeed =
  (client: ClientWithEns) =>
  async ({ queryKey: [{ name }] }: QueryFunctionContext<LookupDeedQueryKey>) => {
    if (!name) throw new Error("name is required");

    const labels = name.split(".");

    const id = labelhash(labels[0]);

    const [bid, deedAddress, , value] = await readContract(client, {
      abi: registrarAbi,
      address: REGISTRAR_ADDRESS,
      functionName: "entries",
      args: [id],
    });

    if (bid === 0) return null;

    const deedOwner = await readContract(client, {
      abi: deedAbi,
      address: deedAddress,
      functionName: "owner",
    });

    if (deedOwner === zeroAddress) return null;

    return { id, value, deedOwner };
  };
