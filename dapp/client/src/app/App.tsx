import React, { useState } from "react";
import { Airlines } from "components";
import { useFlightsApi, useFlightSuretyAppContract } from "hooks";
import { Flight } from "types";
import { shortenAddress } from "utils";

export const App: React.FC = () => {
  const { flights, getFlightByNumber } = useFlightsApi();

  const {
    contract,
    isOperational,
    accounts,
    airlines,
    defaultAccount,
    isWeb3Initialized,
  } = useFlightSuretyAppContract();

  const [selectedFlight, setSelectedFlight] = useState<Flight>();

  console.log({
    flights,
    accounts,
    defaultAccount,
    contract,
    isOperational,
  });

  const handleSubmitToOracles = () => {
    console.log("sending fetchFlightStatus", { selectedFlight });
    contract.methods
      .fetchFlightStatus(
        selectedFlight?.airline,
        selectedFlight?.flightNumber,
        selectedFlight?.timestamp
      )
      .send({ from: defaultAccount }, (error: any, txHash: string) => {
        console.log({ error, txHash });
      });
  };

  return (
    <div>
      <header>
        <h2>FlightSuretyApp</h2>
        {!isWeb3Initialized ? (
          <h4>Initializing Web3 …</h4>
        ) : (
          <>
            <p>Is Operational: {`${isOperational}`}</p>
            <div>
              <label>
                Flight
                <select
                  value={selectedFlight?.flightNumber}
                  onChange={(e) =>
                    setSelectedFlight(getFlightByNumber(e.target.value))
                  }
                >
                  {flights?.map((f) => (
                    <option key={f.flightNumber} value={f.flightNumber}>
                      {f.flightNumber}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={handleSubmitToOracles}>Submit to Oracles</button>
            </div>
            <br />
            <div>
              <Airlines
                airlines={airlines}
                accounts={accounts}
                contract={contract}
              />
              <p>
                Accounts:
                <br />
                <textarea
                  cols={42}
                  rows={32}
                  readOnly
                  value={accounts.map(shortenAddress).join("\n")}
                />
              </p>
            </div>
          </>
        )}
      </header>
    </div>
  );
};
