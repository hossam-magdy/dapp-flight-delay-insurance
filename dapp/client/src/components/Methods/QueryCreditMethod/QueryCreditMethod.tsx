import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract } from "types";
import { toEther } from "utils";
import styles from "../CommonMethod.module.scss";

export const QueryCreditMethod: React.VFC<{
  insuredPassengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ insuredPassengers, accounts, contract }) => {
  const [selectedPassenger, setSelectedPassenger] = useState<Address>("");
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const callQueryCredit = useCallback(() => {
    contract.preparedMethods
      .queryCredit({ from: selectedPassenger })
      .then((result) => {
        const amount = toEther(result);
        setResult(`${amount} ETH`);
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
        setResult(undefined);
      });
  }, [contract.preparedMethods, selectedPassenger]);

  const passengersOptions = accounts.map((a) => ({
    value: a,
    suffix: insuredPassengers.includes(a) ? ` (paid insurance before)` : "",
  }));

  return (
    <div className={styles.container}>
      <h3>Query Credit:</h3>
      as{" "}
      <Select
        options={passengersOptions}
        value={selectedPassenger}
        onChange={setSelectedPassenger}
      />
      <button onClick={callQueryCredit} disabled={!selectedPassenger}>
        Check
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
