import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract, Flight } from "types";
import { shortenAddress } from "utils";
import styles from "../CommonMethod.module.scss";

export const PurchaseFlightInsuranceMethod: React.VFC<{
  flights: Flight[];
  passengers: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ flights, passengers, accounts, contract }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight>();
  const [selectedPassenger, setSelectedPassenger] = useState<Address>("");
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const flightsOptions = (flights || []).map((a) => ({
    value: a.flightNumber,
    label: `${a.flightNumber} (from airline ${shortenAddress(a.airline)})`,
  }));

  // const callPurchaseFlightInsurance = useCallback(() => {
  //   contract.preparedMethods
  //     .payAirlineFunds({
  //       from: selectedAirline,
  //       value: toWei(amount),
  //     })
  //     .then(() => {
  //       setResult(
  //         `${amount} eth were successfully funded by ${selectedAirline}`
  //       );
  //       setError(undefined);
  //     })
  //     .catch(setError);
  // }, [contract.preparedMethods, amount, selectedAirline]);

  return (
    <>
      <div className={styles.container}>
        <h3>[TODO] Purchase Flight Insurance:</h3>
        <Select
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
            step="0.01"
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
          options={passengers}
          value={selectedPassenger}
          onChange={setSelectedPassenger}
        />
        <button
          // onClick={callPurchaseFlightInsurance}
          disabled={!selectedFlight || !selectedPassenger || !amount}
        >
          Purchase Insurance
        </button>
        {result && <div className={styles.result}>{result}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </>
  );
};
