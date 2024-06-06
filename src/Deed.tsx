import { Button, Card, Typography } from "@ensdomains/thorin";
import { type Address, type Hex, encodeFunctionData, formatEther, getAddress } from "viem";
import { useAccount, useEnsName, usePrepareTransactionRequest, useSendTransaction } from "wagmi";
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

  const { sendTransaction, isPending } = useSendTransaction();

  const claim = () => preparedRequest && sendTransaction({ ...preparedRequest, to: REGISTRAR_ADDRESS });

  const { address } = useAccount();

  const isMatchingOwner = !!address && getAddress(owner) === getAddress(address);

  const buttonLabel = (() => {
    if (!isMatchingOwner) return "Cannot claim";

    if (isPrepareLoading) return "Preparing";
    if (!preparedRequest) return "Prepare";

    if (isPending) return "Claiming";

    return "Claim";
  })();

  const buttonIsDisabled = (() => {
    if (!isMatchingOwner) return true;

    if (isPrepareLoading) return true;

    return isPending;
  })();

  return (
    <Card className="deed-card">
      <div className="deed-data">
        <Typography fontVariant="headingThree">{label}</Typography>
        <Typography>{formattedEth} ETH</Typography>
        <Typography>Owned by {primaryName || owner}</Typography>
      </div>
      <div>
        <Button
          disabled={buttonIsDisabled}
          loading={isPrepareLoading || isPending}
          onClick={() => (preparedRequest ? claim() : refetch())}
          colorStyle={preparedRequest ? "accentPrimary" : "accentSecondary"}
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
};
