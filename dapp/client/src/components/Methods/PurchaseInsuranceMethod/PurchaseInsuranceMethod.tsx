import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract, Flight } from "types";
import { shortenAddress, toWei } from "utils";
import styles from "../CommonMethod.module.scss";

export const PurchaseInsuranceMethod: React.VFC<{
  flights: Flight[];
  airlines: Address[];
  insuredPassengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights, insuredPassengers, airlines, accounts, contract }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight>();
  const [selectedPassenger, setSelectedPassenger] = useState<Address>("");
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const flightsOptions = flights.map((a) => ({
    value: a.flightNumber,
    label: `${a.flightNumber} (from airline ${shortenAddress(a.airline)})`,
  }));

  const passengersOptions = accounts
    .filter((a) => !airlines.includes(a))
    .map((a) => ({
      value: a,
      suffix: insuredPassengers.includes(a) ? ` (paid insurance before)` : "",
    }));

  const purchaseFlightInsurance = useCallback(() => {
    if (!selectedFlight) return;
    const { airline, flightNumber } = selectedFlight;
    console.log("toWei(amount)", toWei(amount));
    contract.preparedMethods
      .purchaseInsurance({
        airline,
        flightNumber,
        from: selectedPassenger,
        value: toWei(amount),
      })
      .then(() => {
        setResult(
          `Successfully purchased insurance of flight "${flightNumber}" from airline "${shortenAddress(
            airline
          )}", with amount of: ${amount} ether`
        );
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
        setResult(undefined);
      });
  }, [selectedFlight, contract.preparedMethods, selectedPassenger, amount]);

  return (
    <div className={styles.container}>
      <h3>Purchase Insurance:</h3>
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
      <div>
        <input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={amount}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setAmount(!isNaN(val) ? val : amount);
          }}
        />
        ETH
      </div>
      as
      <Select
        options={passengersOptions}
        value={selectedPassenger}
        onChange={setSelectedPassenger}
      />
      <button
        onClick={purchaseFlightInsurance}
        disabled={!selectedFlight || !selectedPassenger || !amount}
      >
        Purchase
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
