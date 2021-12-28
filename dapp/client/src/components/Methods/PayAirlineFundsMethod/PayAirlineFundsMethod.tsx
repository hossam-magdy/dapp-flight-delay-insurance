import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract } from "types";
import { toWei } from "utils";
import styles from "../CommonMethod.module.scss";

export const PayAirlineFundsMethod: React.VFC<{
  airlines: Address[];
  accounts: Address[];
  contract: Contract;
}> = ({ airlines, accounts, contract }) => {
  const [selectedAirline, setSelectedAirline] = useState<Address>("");
  const [funds, setFunds] = useState<number>(0);
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const options = accounts.map((a) => ({
    value: a,
    suffix: airlines.includes(a) ? " (is airline)" : "",
  }));

  const callPayAirlineFunds = useCallback(() => {
    contract.preparedMethods
      .payAirlineFunds({
        from: selectedAirline,
        value: toWei(funds),
      })
      .then(() => {
        setResult(
          `${funds} eth were successfully funded by ${selectedAirline}`
        );
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
        setResult(undefined);
      });
  }, [contract.preparedMethods, funds, selectedAirline]);

  return (
    <div className={styles.container}>
      <h3>Pay Airline Funds:</h3>
      <Select
        options={options}
        value={selectedAirline}
        onChange={setSelectedAirline}
      />
      <div>
        <input
          type="number"
          step="1"
          min="0"
          value={funds}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setFunds(!isNaN(val) ? val : funds);
          }}
        />
        ETH
      </div>
      <button
        onClick={callPayAirlineFunds}
        disabled={!selectedAirline || !funds}
      >
        Pay Funds
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
