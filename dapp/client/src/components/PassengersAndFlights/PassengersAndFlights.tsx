import { Address, Contract, Flight } from "types";
import {
  GetPassengerCreditMethod,
  PurchaseFlightInsuranceMethod,
  RequestFlightStatusMethod,
  WithdrawPassengerCreditMethod,
} from "../Methods";
import styles from "./PassengersAndFlights.module.scss";

export const PassengersAndFlights: React.VFC<{
  flights: Flight[];
  passengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights = [], passengers, accounts, contract }) => {
  return (
    <section className={styles.container}>
      <h2>Passengers and Flights</h2>
      <div>
        {/* PassengersAndFlights registered:
        <br />
        <textarea
          cols={42}
          rows={5}
          readOnly
          value={flights.map((f) => JSON.stringify(f)).join("\n")}
        /> */}
        <p className={styles.info}>
          Passengers can choose from a fixed list of flight numbers and
          departures
          <br />
          Passengers may pay up to 1 ether for purchasing flight insurance.
          <br />
          If flight is delayed due to airline fault, passenger receives credit
          of 1.5X the amount they paid
          <br />
          Passenger can withdraw any funds owed to them as a result of receiving
          credit for insurance payout
          <br />
          Insurance payouts are not sent directly to passenger's wallet
        </p>
      </div>
      <RequestFlightStatusMethod
        flights={flights}
        passengers={passengers}
        accounts={accounts}
        contract={contract}
      />
      <PurchaseFlightInsuranceMethod
        flights={flights}
        passengers={passengers}
        accounts={accounts}
        contract={contract}
      />
      <GetPassengerCreditMethod
        flights={flights}
        passengers={passengers}
        accounts={accounts}
        contract={contract}
      />
      <WithdrawPassengerCreditMethod
        flights={flights}
        passengers={passengers}
        accounts={accounts}
        contract={contract}
      />
    </section>
  );
};
