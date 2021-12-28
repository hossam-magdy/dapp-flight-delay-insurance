import React from "react";
import { Airlines, DevStatus, PassengersAndFlights } from "components";
import { useFlightsApi, useFlightSuretyAppContract } from "hooks";
import styles from "./App.module.scss";

export const App: React.FC = () => {
  const { flights } = useFlightsApi();

  const {
    contract,
    isOperational,
    accounts,
    airlines,
    insuredPassengers,
    isWeb3Connected,
  } = useFlightSuretyAppContract();

  return (
    <article className={styles.container}>
      <h1 className={styles.header}>
        Flight Surety (Flight-delay insurance DApp)
      </h1>
      <section className={styles.intro}>
        This is a <b>flight-delay insurance</b> DApp (decentralized
        application). The business entities and parties involved are:{" "}
        <i>airlines</i>, <i>passengers</i>, and <i>flights</i>. The DApp is
        utilizing: SmartContracts (in solidity), Oracles (getting off-chain info
        / flight status code), multi-party consensus algorithms (for registering
        airlines and for trusting oracle reports), React (client DApp).
      </section>
      {!isWeb3Connected ? (
        <h4>Connecting Web3 …</h4>
      ) : (
        <>
          <p className={styles.status}>Is Operational: {`${isOperational}`}</p>
          <PassengersAndFlights
            flights={flights}
            airlines={airlines}
            insuredPassengers={insuredPassengers}
            accounts={accounts}
            contract={contract}
          />
          <Airlines
            airlines={airlines}
            accounts={accounts}
            contract={contract}
          />
          <DevStatus
            accounts={accounts}
            airlines={airlines}
            insuredPassengers={insuredPassengers}
            contract={contract}
          />
        </>
      )}
    </article>
  );
};
