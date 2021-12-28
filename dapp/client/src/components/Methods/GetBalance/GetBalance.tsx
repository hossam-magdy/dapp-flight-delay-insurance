import { useCallback, useState } from "react";
import { Select } from "components/Select";
import { Address, Contract } from "types";
import { toEther } from "utils";
import styles from "../CommonMethod.module.scss";

export const GetBalance: React.VFC<{
  accountsOptions: { value: Address; label: string }[];
  contract: Contract;
}> = ({ accountsOptions, contract }) => {
  const [selectedAccount, setSelectedAccount] = useState<Address>("");
  const [result, setResult] = useState<String>();
  const [error, setError] = useState<String>();

  const callQueryBalance = useCallback(() => {
    contract.preparedMethods
      .getBalance(selectedAccount)
      .then((result) => {
        const amount = toEther(result);
        setResult(`${amount} ETH`);
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
        setResult(undefined);
      });
  }, [contract.preparedMethods, selectedAccount]);

  return (
    <div className={styles.container}>
      <h3>Query Account Balance:</h3>
      as{" "}
      <Select
        options={accountsOptions}
        value={selectedAccount}
        onChange={setSelectedAccount}
      />
      <button onClick={callQueryBalance} disabled={!selectedAccount}>
        Check
      </button>
      {result && <div className={styles.result}>{result}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
