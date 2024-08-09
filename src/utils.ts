import { formatEther } from "viem";

export const shortenAddress = (address = "", maxLength = 10, leftSlice = 5, rightSlice = 5) => {
  if (address.length < maxLength) {
    return address;
  }

  return `${address.slice(0, leftSlice + 2)}...${address.slice(-rightSlice)}`;
};

export const createDisplayEth = (value: bigint) => {
  const number = Number(formatEther(value));
  const options: Intl.NumberFormatOptions & { [x: string]: string } = {
    style: "currency",
    currency: "eth",
    // @ts-expect-error
    useGrouping: "auto",
    trailingZeroDisplay: "auto",
  };
  if (number < 0.00001) {
    options.maximumSignificantDigits = 1;
  }
  options.minimumFractionDigits = 4;
  options.maximumFractionDigits = 4;
  options.currencyDisplay = "name";
  return new Intl.NumberFormat(undefined, options).format(number);
};
