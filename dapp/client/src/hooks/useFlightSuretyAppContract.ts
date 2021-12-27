import { useEffect, useMemo, useState } from "react";
import { config, FlightSuretyApp } from "config";
import { Address } from "types";
import { promisifyWeb3Call } from "utils";
import { useWeb3 } from "./useWeb3";

export const useFlightSuretyAppContract = () => {
  const {
    web3,
    accounts,
    defaultAccount,
    isInitialized: isWeb3Initialized,
  } = useWeb3();

  const [contract] = useState(
    () =>
      new web3.eth.Contract(FlightSuretyApp.abi as any, config.appAddress, {
        gas: 220000, // TODO: check why it fails lower than that, or if unset
      })
  );
  const [isOperational, setIsOperational] = useState<boolean>();
  const [airlines, setAirlines] = useState<Address[]>([]);

  const preparedMethods = useMemo(
    () => ({
      isOperational: () => {
        return promisifyWeb3Call<boolean>(() =>
          contract.methods.isOperational().call()
        );
      },
      airlineFunds: (args?: { from?: Address }) => {
        return promisifyWeb3Call<string>(() =>
          contract.methods.airlineFunds().call(args)
        );
      },
      isAirline: (address: Address) => {
        return promisifyWeb3Call<string>(() =>
          contract.methods.isAirline(address).call()
        );
      },
      payAirlineFunds: (args: { from: Address; value: string }) => {
        return promisifyWeb3Call(() =>
          contract.methods.payAirlineFunds().send(args)
        );
      },
      registerAirline: (args: { newAirline: Address; from: Address }) => {
        return promisifyWeb3Call(() =>
          contract.methods
            .registerAirline(args.newAirline)
            .send({ from: args.from })
        );
      },
      MIN_AIRLINE_FUNDING: (args?: { from?: Address }) => {
        return promisifyWeb3Call<string>(() =>
          contract.methods.MIN_AIRLINE_FUNDING().call(args)
        );
      },
      // payAirlineFunds: () => promisifyWeb3Call(() => {}),
    }),

    [contract]
  );

  useEffect(() => {
    if (!isWeb3Initialized) return;

    console.log("calling isOperational()", { defaultAccount, isOperational });
    preparedMethods
      .isOperational()
      .then((result) => setIsOperational(!!result));
    // contract.methods
    //   .isOperational()
    //   .call({ from: defaultAccount }, (_e: any, result?: boolean) => {
    //     console.log("[isOperational]", result);
    //     result !== undefined && setIsOperational(!!result);
    //   });

    // Watch events.OracleRequest
    contract.events.OracleRequest({}, (error: any, event: any) => {
      console.log("[event:OracleRequest]", { error, event });
    });

    // Watch events.FlightStatusInfo
    contract.events.FlightStatusInfo({}, (error: any, event: any) => {
      console.log("[event:FlightStatusInfo]", { error, event });
    });

    // Watch events.FlightStatusInfo
    contract.events.AirlineRegistered(
      { fromBlock: 0 },
      (error: any, event: { returnValues: { airline: Address } }) => {
        const newAirline = event.returnValues.airline;
        console.log("[event:AirlineRegistered]", newAirline, { error });
        setAirlines((airlines) => [...airlines, newAirline]);
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Initialized]);

  return {
    contract: useMemo(
      () => Object.assign(contract, { preparedMethods }),
      [contract, preparedMethods]
    ),
    accounts,
    airlines,
    defaultAccount,
    isWeb3Initialized,
    isOperational,
  };
};
