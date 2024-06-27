import { isEncodedLabelhash, truncateFormat } from "@ensdomains/ensjs/utils";
import { Button, Card, Typography } from "@ensdomains/thorin";
import { useQueryClient } from "@tanstack/react-query";
import { type Address, type Hex, encodeFunctionData, formatEther, getAddress } from "viem";
import {
  useAccount,
  useEnsName,
  usePrepareTransactionRequest,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { registrarAbi } from "./abis/registrar";
import { REGISTRAR_ADDRESS } from "./constants";

type Props = {
  id: Hex;
  name: string;
  value: bigint;
  owner: Address;
  isExact?: boolean;
};

export const DeedComponent = ({ id, name, value, owner, isExact }: Props) => {
  const queryClient = useQueryClient();
  const label = `${isExact ? "Exact Match: " : ""}${name}`;
  const formattedEth = formatEther(value);
  const { data: primaryName } = useEnsName({ address: owner });

  const {
    data: preparedRequest,
    isLoading: isPrepareLoading,
    refetch,
  } = usePrepareTransactionRequest({
    to: REGISTRAR_ADDRESS,
    data: encodeFunctionData({
      abi: registrarAbi,
      functionName: "releaseDeed",
      args: [id],
    }),
    query: { enabled: false },
  });

  const prepare = () => {
    queryClient.resetQueries({
      queryKey: ["prepareTransactionRequest"],
      exact: false,
    });
    refetch();
  };

  const { sendTransaction, isPending, data: hash } = useSendTransaction();

  const { data: transactionReceipt } = useWaitForTransactionReceipt({ hash });

  const claim = () => preparedRequest && sendTransaction({ ...preparedRequest, to: REGISTRAR_ADDRESS });

  const { address } = useAccount();

  const isMatchingOwner = !!address && getAddress(owner) === getAddress(address);

  const buttonProps = (() => {
    if (!isMatchingOwner) return { disabled: true, children: "Cannot claim" } as const;

    if (isPrepareLoading) return { disabled: true, children: "Preparing", loading: true } as const;
    if (!preparedRequest)
      return { disabled: false, children: "Prepare", onClick: prepare, colorStyle: "accentSecondary" } as const;

    if (isPending) return { disabled: true, children: "Waiting for wallet", loading: true } as const;
    if (transactionReceipt) {
      if (transactionReceipt.status === "reverted")
        return { disabled: false, children: "Try again", onClick: () => claim(), colorStyle: "redPrimary" } as const;
      return { disabled: true, children: "Claimed" } as const;
    }
    if (hash) return { disabled: true, children: "Claiming", loading: true } as const;

    return { disabled: false, children: "Claim", onClick: () => claim(), colorStyle: "accentPrimary" } as const;
  })();

  return (
    <Card className="deed-card">
      <div className="deed-data">
        <Typography fontVariant="headingThree">{isEncodedLabelhash(label) ? truncateFormat(label) : label}</Typography>
        <Typography>{formattedEth} ETH</Typography>
        <Typography>Owned by {primaryName || owner}</Typography>
      </div>
      <div>
        <Button {...buttonProps} />
      </div>
    </Card>
  );
};
