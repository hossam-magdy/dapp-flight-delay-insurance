import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract } from "types";
import styles from "../CommonMethod.module.scss";
import { toEther } from "utils";

export const GetAirlineFundsMethod: React.VFC<{
  airlines: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ airlines, accounts, contract }) => {
  const [selectedAirline, setSelectedAirline] = useState<Address>("");
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const options = accounts.map((a) => ({
    value: a,
    suffix: airlines.includes(a) ? " (is airline)" : "",
  }));

  const callMinAirlineFunds = useCallback(() => {
    contract.preparedMethods
      .MIN_AIRLINE_FUNDING()
      .then((result) => {
        const amount = toEther(result);
        setResult(`MIN_AIRLINE_FUNDING is: ${amount} ETH`);
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
        setResult(undefined);
      });
  }, [contract.preparedMethods]);

  const callAirlineFunds = useCallback(() => {
    contract.preparedMethods
      .airlineFunds({ from: selectedAirline })
      .then((result) => {
        const amount = toEther(result);
        setResult(
          `${amount} ETH were funded by the airline: ${selectedAirline}`
        );
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
        setResult(undefined);
      });
  }, [contract.preparedMethods, selectedAirline]);

  return (
    <div className={styles.container}>
      <button onClick={callMinAirlineFunds}>Get MIN_AIRLINE_FUNDING</button> |{" "}
      <h3>Get Airline Funds:</h3>
      as{" "}
      <Select
        options={options}
        value={selectedAirline}
        onChange={setSelectedAirline}
      />
      <button onClick={callAirlineFunds} disabled={!selectedAirline}>
        Check
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
