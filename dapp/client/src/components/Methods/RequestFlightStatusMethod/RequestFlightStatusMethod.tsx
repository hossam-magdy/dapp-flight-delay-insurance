import { useState } from "react";
import { Select } from "components/Select";
import { Address, Contract, Flight, FlightStatusCode } from "types";
import { shortenAddress } from "utils";
import styles from "../CommonMethod.module.scss";

export const RequestFlightStatusMethod: React.VFC<{
  flights: Flight[];
  // passengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights, accounts, contract }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight>();
  const [selectedFrom, setSelectedFrom] = useState<Address>("");
  const [result, setResult] = useState<string | number>();
  const [error, setError] = useState<string>();

  const flightsOptions = (flights || []).map((a) => ({
    value: a.flightNumber,
    label: `${a.flightNumber} (from airline ${shortenAddress(a.airline)})`,
  }));

  const handleSubmitToOracles = () => {
    if (!selectedFlight) return;
    contract.preparedMethods
      .fetchFlightStatus(
        { ...selectedFlight, from: selectedFrom },
        (statusCode) => {
          const status = `${statusCode} (${FlightStatusCode[statusCode]})`;
          setResult(status);
          console.log("[DONE:fetchFlightStatus]", { statusCode });
        }
      )
      .catch(setError);
  };

  return (
    <div className={styles.container}>
      <h3>Request Flight Status:</h3>
      <Select
        placeholder="Choose flight …"
        options={flightsOptions}
        value={selectedFlight?.flightNumber}
        onChange={(flightNumber) =>
          setSelectedFlight(
            flights?.find((f) => f.flightNumber === flightNumber)
          )
        }
      />{" "}
      as{" "}
      <Select
        options={accounts}
        value={selectedFrom}
        onChange={setSelectedFrom}
      />
      <button
        onClick={handleSubmitToOracles}
        disabled={!selectedFrom || !selectedFlight}
      >
        Request
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.info}>
        This sends a fetchFlightStatus() transaction, which emits OracleRequest,
        then the each of the targeted/indexed oracles report the
        FlightStatusCode back to the smart contract by emitting OracleReport
      </div>
    </div>
  );
};
