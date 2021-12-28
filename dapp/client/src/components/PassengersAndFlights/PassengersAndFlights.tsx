import { Address, Contract, Flight } from "types";
import {
  PurchaseInsuranceMethod,
  QueryCreditMethod,
  QueryPurchasedInsuranceMethod,
  RequestFlightStatusMethod,
  WithdrawCreditMethod,
} from "../Methods";
import styles from "./PassengersAndFlights.module.scss";

export const PassengersAndFlights: React.VFC<{
  flights: Flight[];
  airlines: Address[];
  insuredPassengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights = [], airlines, insuredPassengers, accounts, contract }) => {
  return (
    <section className={styles.container}>
      <h2>Passengers and Flights</h2>
      <div>
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
        accounts={accounts}
        contract={contract}
      />
      <PurchaseInsuranceMethod
        flights={flights}
        airlines={airlines}
        insuredPassengers={insuredPassengers}
        accounts={accounts}
        contract={contract}
      />
      <QueryPurchasedInsuranceMethod
        flights={flights}
        airlines={airlines}
        insuredPassengers={insuredPassengers}
        accounts={accounts}
        contract={contract}
      />
      <QueryCreditMethod
        insuredPassengers={insuredPassengers}
        accounts={accounts}
        contract={contract}
      />
      <WithdrawCreditMethod
        insuredPassengers={insuredPassengers}
        accounts={accounts}
        contract={contract}
      />
    </section>
  );
};
