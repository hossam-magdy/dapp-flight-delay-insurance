import { useCallback, useState } from "react";
import Web3 from "web3";
import { SelectAccount } from "components/SelectAccount";
import { Address, Contract } from "types";
import styles from "./GetAirlineFundsMethod.module.scss";

export const GetAirlineFundsMethod: React.VFC<{
  airlines: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ airlines, accounts, contract }) => {
  const [selectedAirline, setSelectedAirline] = useState<Address>();
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const options = accounts.map((a) => ({
    address: a,
    suffix: airlines.includes(a) ? " (is airline)" : "",
  }));

  const callMinAirlineFunds = useCallback(() => {
    contract.preparedMethods
      .MIN_AIRLINE_FUNDING()
      .then((output) => {
        const amount = Web3.utils.fromWei(output, "ether");
        setResult(`${amount} ETH`);
        setError(undefined);
      })
      .catch(setError);
  }, [contract.preparedMethods]);

  const callAirlineFunds = useCallback(() => {
    contract.preparedMethods
      .airlineFunds({ from: selectedAirline })
      .then((result) => {
        const amount = Web3.utils.fromWei(result, "ether");
        setResult(`${amount} ETH`);
        setError(undefined);
      })
      .catch(setError);
  }, [contract.preparedMethods, selectedAirline]);

  return (
    <>
      <div className={styles.container}>
        <button onClick={callMinAirlineFunds}>Get MIN_AIRLINE_FUNDING</button> |{" "}
        <h3>Get Airline Funds:</h3>
        as{" "}
        <SelectAccount
          accounts={options}
          value={selectedAirline}
          onChange={setSelectedAirline}
        />
        <button onClick={callAirlineFunds} disabled={!selectedAirline}>
          Check
        </button>
        {result && <div className={styles.result}>{result}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </>
  );
};
