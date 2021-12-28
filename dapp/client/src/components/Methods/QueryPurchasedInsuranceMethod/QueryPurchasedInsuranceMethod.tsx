import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract, Flight } from "types";
import { shortenAddress, toEther } from "utils";
import styles from "../CommonMethod.module.scss";

export const QueryPurchasedInsuranceMethod: React.VFC<{
  flights: Flight[];
  airlines: Address[];
  insuredPassengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights, insuredPassengers, airlines, accounts, contract }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight>();
  const [selectedPassenger, setSelectedPassenger] = useState<Address>("");
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const flightsOptions = flights.map((a) => ({
    value: a.flightNumber,
    label: `${a.flightNumber} (from airline ${shortenAddress(a.airline)})`,
  }));

  const purchaseFlightInsurance = useCallback(() => {
    if (!selectedFlight) return;
    const { airline, flightNumber } = selectedFlight;
    contract.preparedMethods
      .queryPurchasedInsurance({
        airline,
        flightNumber,
        from: selectedPassenger,
      })
      .then((result) => {
        const amount = toEther(result);
        setResult(`${amount} ETH`);
        setError(undefined);
      })
      .catch(setError);
  }, [selectedFlight, contract.preparedMethods, selectedPassenger]);

  const passengersOptions = accounts
    .filter((a) => !airlines.includes(a))
    .map((a) => ({
      value: a,
      suffix: insuredPassengers.includes(a) ? ` (paid insurance before)` : "",
    }));

  return (
    <div className={styles.container}>
      <h3>Query Insurance Purchased:</h3>
      <Select
        placeholder="Choose flight …"
        options={flightsOptions}
        value={selectedFlight?.flightNumber}
        onChange={(flightNumber) =>
          setSelectedFlight(
            flights?.find((f) => f.flightNumber === flightNumber)
          )
        }
      />
      as
      <Select
        options={passengersOptions}
        value={selectedPassenger}
        onChange={setSelectedPassenger}
      />
      <button
        onClick={purchaseFlightInsurance}
        disabled={!selectedFlight || !selectedPassenger}
      >
        Check
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
