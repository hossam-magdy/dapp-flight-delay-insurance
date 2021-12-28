import { Address, Contract, Flight } from "types";
import styles from "./Passengers.module.scss";

export const Passengers: React.VFC<{
  flights?: Flight[];
  airlines: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights = [], airlines, accounts, contract }) => {
  return (
    <div className={styles.container}>
      <h2>Passengers</h2>
      <div>
        Passengers registered:
        <br />
        <textarea
          cols={42}
          rows={5}
          readOnly
          value={flights.map((f) => JSON.stringify(f)).join("\n")}
        />
        <p>
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
      {/*
      <PurchaseFlightInsurance
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
      <CreditInquiry
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
      <WithdrawCredit
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
      */}
    </div>
  );
};
