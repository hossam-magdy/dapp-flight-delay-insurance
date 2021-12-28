import React from "react";
import { Airlines, PassengersAndFlights } from "components";
import { useFlightsApi, useFlightSuretyAppContract } from "hooks";
import styles from "./App.module.scss";

export const App: React.FC = () => {
  const { flights } = useFlightsApi();

  const { contract, isOperational, accounts, airlines, isWeb3Initialized } =
    useFlightSuretyAppContract();

  return (
    <article className={styles.container}>
      <h1 className={styles.header}>FlightSuretyApp</h1>
      {!isWeb3Initialized ? (
        <h4>Initializing Web3 …</h4>
      ) : (
        <>
          <p className={styles.status}>Is Operational: {`${isOperational}`}</p>
          <section className={styles.intro}>
            This is a <b>flight-delay insurance DApp</b> (decentralized
            application). The business entities and parties involved are:{" "}
            <i>airlines</i>, <i>passengers</i>, and <i>flights</i>. The DApp is
            utilizing: SmartContracts (in solidity), Oracles (getting off-chain
            info / flight status code), multi-party consensus algorithms (for
            registering airlines and for trusting oracle reports), React (client
            DApp).
          </section>
          <PassengersAndFlights
            flights={flights}
            passengers={accounts.filter((a) => !airlines.includes(a))}
            accounts={accounts}
            contract={contract}
          />
          <Airlines
            airlines={airlines}
            accounts={accounts}
            contract={contract}
          />
          <section className={styles.techInfo}>
            <p>Accounts:</p>
            <pre>
              {accounts
                .map((a) =>
                  airlines.includes(a) ? `- ${a} (is airline)` : `- ${a}`
                )
                .join("\n")}
            </pre>{" "}
          </section>
        </>
      )}
    </article>
  );
};
