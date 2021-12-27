import { Address, Contract } from "types";
import { shortenAddress } from "utils";
import {
  IsAirlineMethod,
  PayAirlineFundsMethod,
  RegisterAirlineMethod,
} from "./Methods";
import { GetAirlineFundsMethod } from "./Methods/GetAirlineFundsMethod/GetAirlineFundsMethod";
import styles from "./Airlines.module.scss";

export const Airlines: React.VFC<{
  airlines: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ airlines, accounts, contract }) => {
  return (
    <div className={styles.container}>
      <h2>Airlines</h2>
      <div>
        Airlines registered:
        <br />
        <textarea
          cols={42}
          rows={5}
          readOnly
          value={airlines.map(shortenAddress).join("\n")}
        />
        <p>
          Only existing airlines, with enough funds, can consent on registering
          new airlines.
          <br />
          If the number of registered airlines are less than 4, then only one consent is needed. Otherwise 50% of the registered and funded airlines must consent.
        </p>
      </div>
      <IsAirlineMethod
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
      <RegisterAirlineMethod
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
      <GetAirlineFundsMethod
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
      <PayAirlineFundsMethod
        airlines={airlines}
        accounts={accounts}
        contract={contract}
      />
    </div>
  );
};
