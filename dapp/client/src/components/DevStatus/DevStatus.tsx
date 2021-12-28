import { config } from "config";
import React, { useEffect, useMemo, useState } from "react";
import { Address, Contract } from "types";
import { logWeb3Event, shortenAddress } from "utils";
import { GetBalance } from "../Methods";
import styles from "./DevStatus.module.scss";

export const DevStatus: React.VFC<{
  airlines: Address[];
  accounts: Address[];
  insuredPassengers: Address[];
  contract: Contract;
}> = ({ accounts, airlines, insuredPassengers, contract }) => {
  const [events, setEvents] = useState<
    { event: string; returnValues: Record<string, any> }[]
  >([]);

  useEffect(() => {
    contract.events.allEvents({ fromBlock: 0 }, (error: any, event: any) => {
      const sanitizedEventObj = logWeb3Event(event, error);
      const newEvent = {
        event: sanitizedEventObj.event,
        returnValues: sanitizedEventObj.returnValues,
      };
      setEvents((old) => [...old, newEvent]);
    });
  }, [contract.events]);

  const accountsOptions = useMemo(
    () => [
      {
        value: config.appAddress,
        label: `${shortenAddress(config.appAddress)} (App Contract)`,
      },
      {
        value: config.dataAddress,
        label: `${shortenAddress(config.dataAddress)} (Data Contract)`,
      },
      ...accounts.map((a) => ({
        value: a,
        label: airlines.includes(a)
          ? `${shortenAddress(a)} (is airline)`
          : insuredPassengers.includes(a)
          ? `${shortenAddress(a)} (paid insurance before)`
          : "",
      })),
    ],
    [accounts, airlines, insuredPassengers]
  );

  const accountsListText = useMemo(
    () =>
      [
        `- ${config.appAddress} (App Contract)`,
        `- ${config.dataAddress} (Data Contract)`,
        ...accounts.map((a) =>
          airlines.includes(a)
            ? `- ${a} (is airline)`
            : insuredPassengers.includes(a)
            ? `- ${a} (paid insurance before)`
            : `- ${a}`
        ),
      ].join("\n"),
    [accounts, airlines, insuredPassengers]
  );

  return (
    <section className={styles.container}>
      <h2>Dev Status (listing all accounts, and listening to all events)</h2>
      <GetBalance accountsOptions={accountsOptions} contract={contract} />
      <p>Accounts:</p>
      <pre>{accountsListText}</pre>
      <p>Events:</p>
      <pre>
        {events
          .map(
            (event) =>
              `- ${event.event}: ${
                Object.keys(event.returnValues).length <= 1
                  ? JSON.stringify(event.returnValues)
                  : JSON.stringify(event.returnValues, null, 4)
              }`
          )
          .join("\n")}
      </pre>{" "}
    </section>
  );
};
