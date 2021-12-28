import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract, Flight } from "types";
import styles from "../CommonMethod.module.scss";

export const GetPassengerCreditMethod: React.VFC<{
  flights: Flight[];
  passengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights, passengers, accounts, contract }) => {
  const [selectedPassenger, setSelectedPassenger] = useState<Address>("");
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  // const callGetPassengerCredit = useCallback(() => {
  //   contract.preparedMethods
  //     .airlineFunds({ from: selectedPassenger })
  //     .then((result) => {
  //       const amount = toEther(result);
  //       setResult(`${amount} ETH`);
  //       setError(undefined);
  //     })
  //     .catch(setError);
  // }, [contract.preparedMethods, selectedPassenger]);

  return (
    <>
      <div className={styles.container}>
        <h3>[TODO] Check Passenger Insurance Credit:</h3>
        as{" "}
        <Select
          options={passengers}
          value={selectedPassenger}
          onChange={setSelectedPassenger}
        />
        <button
          // onClick={callGetPassengerCredit}
          disabled={!selectedPassenger}
        >
          Check
        </button>
        {result && <div className={styles.result}>{result}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </>
  );
};
