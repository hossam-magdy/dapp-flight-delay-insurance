import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract } from "types";
import styles from "../CommonMethod.module.scss";

export const RegisterAirlineMethod: React.VFC<{
  airlines: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ airlines, accounts, contract }) => {
  const [newAirline, setNewAirline] = useState<Address>("");
  const [from, setFrom] = useState<Address>("");
  const [error, setError] = useState<String>();

  const options = accounts.map((a) => ({
    value: a,
    suffix: airlines.includes(a) ? " (is airline)" : "",
  }));

  const registerNewAirline = useCallback(() => {
    contract.preparedMethods
      .registerAirline({ newAirline, from })
      .then(() => setError(undefined))
      .catch(setError);
  }, [contract.preparedMethods, from, newAirline]);

  return (
    <>
      <div className={styles.container}>
        <h3>Register new airline:</h3>
        <Select
          options={options}
          value={newAirline}
          onChange={setNewAirline}
        />
        as
        <Select options={options} value={from} onChange={setFrom} />
        <button onClick={registerNewAirline} disabled={!newAirline || !from}>
          Register
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </>
  );
};
