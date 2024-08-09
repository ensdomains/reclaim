import { Button, Card, Input, Skeleton, Spinner, Typography } from "@ensdomains/thorin";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { type Hex, formatEther, labelhash } from "viem";
import { useAccount, useClient, useConnect, useDisconnect } from "wagmi";
import { DeedComponent } from "./Deed";
import { lookupDeed } from "./query/lookupDeed";
import { getDeedStatsQueryFn, getDeedsForAccountQueryFn } from "./query/reclaimSubgraph";
import { useSimpleSearch } from "./query/useSimpleSearch";
import { createDisplayEth, shortenAddress } from "./utils";

const getWarning = () => false;

function App() {
  const account = useAccount();
  const client = useClient();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [searchValue, setSearchValue] = useState("");

  const warning = getWarning();
  const { data: deedStats, isLoading: isDeedStatsLoading } = useQuery({
    queryFn: getDeedStatsQueryFn,
    queryKey: ["deedStats"],
  });

  const search = useSimpleSearch();

  const reference = search.data || {
    address: null,
    is2ldEth: false,
    name: null,
  };

  const { data: deedsData, isLoading: isDeedsDataLoading } = useQuery({
    queryKey: [reference, "getDeedsForAccount"],
    queryFn: getDeedsForAccountQueryFn(client),
    enabled: !!reference.address,
  });

  const { data: singleDeed, isLoading: isSingleDeedLoading } = useQuery({
    queryKey: [reference, "lookupDeed"],
    queryFn: lookupDeed(client),
    enabled: !!reference.name && reference.is2ldEth,
  });

  const isLoading = isSingleDeedLoading || isDeedsDataLoading || search.isLoading;
  const isDebouncing = search.variables !== searchValue && search.variables !== account.address;
  const isEmpty = !searchValue && !account.address;

  const deeds = deedsData?.deeds || [];

  useEffect(() => {
    if (searchValue) search.mutate(searchValue);
    else if (account.address) search.mutate(account.address);
    else search.mutate("");
  }, [searchValue, search.mutate, account.address]);

  return (
    <div className="App">
      <header>
        <Typography fontVariant="headingTwo">Unclaimed deposit search</Typography>
        {warning && <span style={{ color: "yellow", marginBottom: "5px" }}>{warning}</span>}
        <Card>
          <Input
            placeholder="Enter ENS name or ETH address"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            label="Search"
            hideLabel
            clearable
          />
          <div>or</div>
          {account.isConnected ? (
            <div>
              <Typography>Connected address: {account.address}</Typography>
              <Button onClick={() => disconnect()} colorStyle="accentSecondary">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => connect({ connector: connectors[0] })}>Connect</Button>
          )}
        </Card>
      </header>

      {(isLoading || isDebouncing) && !isEmpty && (
        <Card>
          <Spinner size="large" color="accent" />
        </Card>
      )}

      {search.variables && !isDebouncing && !isLoading && !singleDeed && !deedsData && (
        <Card>
          <Typography fontVariant="headingThree">No results found</Typography>
        </Card>
      )}

      {singleDeed && reference.name && (
        <DeedComponent
          id={singleDeed.id}
          name={reference.name}
          owner={singleDeed.deedOwner}
          value={singleDeed.value}
          isExact
        />
      )}

      {deedsData && (
        <div className="account-deeds">
          <div className="account-deeds-heading">
            <Typography fontVariant="headingThree">
              Showing results for account {shortenAddress(deedsData.id)}
            </Typography>
            <Typography>
              <b>{deeds.length}</b> claimable deposits found with a total value of{" "}
              <b>{formatEther(deedsData.sum)} ETH</b>
            </Typography>
          </div>
          <div className="deeds-container">
            {deeds.map((d) => (
              <DeedComponent
                id={labelhash(d.name)}
                name={d.name}
                owner={deedsData.id as Hex}
                value={d.value}
                key={d.id}
              />
            ))}
          </div>
        </div>
      )}
      <footer>
        <Typography>
          There are currently{" "}
          <Skeleton style={{ display: "inline-block" }} loading={isDeedStatsLoading}>
            <b>{deedStats?.numOfDeeds ?? "12345"}</b>
          </Skeleton>{" "}
          deeds holding{" "}
          <Skeleton style={{ display: "inline-block" }} loading={isDeedStatsLoading}>
            <b>{deedStats?.currentValue ? createDisplayEth(deedStats.currentValue) : "0.0000"}</b>
          </Skeleton>
          <br />
          To understand more about these unclaimed deposits,{" "}
          <a href="https://medium.com/@makoto_inoue/how-to-get-back-the-unclaimed-deposit-1e2b1767b930">
            read the blog post
          </a>
          .
        </Typography>
      </footer>
    </div>
  );
}

export default App;
