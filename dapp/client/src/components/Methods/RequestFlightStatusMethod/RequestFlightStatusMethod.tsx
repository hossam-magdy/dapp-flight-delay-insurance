import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract, Flight, FlightStatusCode } from "types";
import { shortenAddress } from "utils";
import styles from "../CommonMethod.module.scss";

export const RequestFlightStatusMethod: React.VFC<{
  flights: Flight[];
  passengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights, passengers, accounts, contract }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight>();
  const [selectedPassenger, setSelectedPassenger] = useState<Address>("");
  const [result, setResult] = useState<string | number>();
  const [error, setError] = useState<string>();

  const flightsOptions = (flights || []).map((a) => ({
    value: a.flightNumber,
    label: `${a.flightNumber} (from airline ${shortenAddress(a.airline)})`,
  }));

  const handleSubmitToOracles = () => {
    if (!selectedFlight) return;
    console.log("sending fetchFlightStatus", { selectedFlight });
    contract.preparedMethods.fetchFlightStatus(
      { ...selectedFlight, from: selectedPassenger },
      (statusCode) => {
        const status = `${statusCode} (${FlightStatusCode[statusCode]})`;
        setResult(status);
        console.log("[DONE:fetchFlightStatus]", { statusCode });
      }
    ).catch(setError);
    // .catch(console.error);
  };

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
        <h3>Request Flight Status:</h3>
        <Select
          options={flightsOptions}
          value={selectedFlight?.flightNumber}
          onChange={(flightNumber) =>
            setSelectedFlight(
              flights?.find((f) => f.flightNumber === flightNumber)
            )
          }
          placeholder="Choose flight …"
        />{" "}
        as passenger{" "}
        <Select
          options={passengers}
          value={selectedPassenger}
          onChange={setSelectedPassenger}
        />
        <button
          onClick={handleSubmitToOracles}
          disabled={!selectedPassenger || !selectedFlight}
        >
          Request
        </button>
        {result && <div className={styles.result}>{result}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.info}>
          This sends a fetchFlightStatus() transaction, which emits
          OracleRequest, then the each of the targeted/indexed oracles report
          the FlightStatusCode back to the smart contract by emitting
          OracleReport
        </div>
      </div>
    </>
  );
};
