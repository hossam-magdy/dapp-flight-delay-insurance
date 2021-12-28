import { useEffect, useMemo, useState } from "react";
import { config, FlightSuretyApp } from "config";
import { Address, FlightStatusCode } from "types";
import { logWeb3Event, promisifyWeb3Call } from "utils";
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
  const [insuredPassengers, setInsuredPassengers] = useState<Address[]>([]);

  const preparedMethods = useMemo(
    () => ({
      isOperational: () => {
        console.log("[calling isOperational()]");
        return promisifyWeb3Call<boolean>(() =>
          contract.methods.isOperational().call()
        );
      },
      airlineFunds: (args?: { from?: Address }) => {
        console.log("[calling airlineFunds(…)]");
        return promisifyWeb3Call<string>(() =>
          contract.methods.airlineFunds().call(args)
        );
      },
      isAirline: (address: Address) => {
        console.log("[calling isAirline(…)]");
        return promisifyWeb3Call<string>(() =>
          contract.methods.isAirline(address).call()
        );
      },
      payAirlineFunds: (args: { from: Address; value: string }) => {
        console.log("[sending payAirlineFunds()]");
        return promisifyWeb3Call(() =>
          contract.methods.payAirlineFunds().send(args)
        );
      },
      registerAirline: (args: { newAirline: Address; from: Address }) => {
        console.log("[sending registerAirline(…)]");
        return promisifyWeb3Call(() =>
          contract.methods
            .registerAirline(args.newAirline)
            .send({ from: args.from })
        );
      },
      MIN_AIRLINE_FUNDING: (args?: { from?: Address }) => {
        console.log("[calling MIN_AIRLINE_FUNDING()]");
        return promisifyWeb3Call<string>(() =>
          contract.methods.MIN_AIRLINE_FUNDING().call(args)
        );
      },
      fetchFlightStatus: (
        args: {
          airline: Address;
          flightNumber: string;
          timestamp: string | number;
          from?: Address;
        },
        cbWhenStatusReceived?: (statusCode: FlightStatusCode) => any
      ) => {
        return new Promise((resolve, reject) => {
          try {
            console.log("[sending fetchFlightStatus(…)]");
            const filter: Record<string, string | number> = {
              airline: args.airline,
              // Indexed strings in event values are hashed by keccack256
              // https://blog.8bitzen.com/posts/09-12-2019-working-with-an-indexed-string-in-web3-events
              // flightNumber: args.flightNumber,
              // flightNumber: web3.utils.keccak256(args.flightNumber),
              // "0x80f6999a9192fb9aaa249becaa50c8a6972f4ab3e649616f522cb3877ed495fd"
              // "0x80f6999a9192fb9aaa249becaa50c8a6972f4ab3e649616f522cb3877ed495fd"
              timestamp: args.timestamp,
            };
            contract.once(
              "OracleRequest",
              { filter },
              (_err: any, event: any) => {
                filter.key = event?.returnValues?.key;
                contract.once(
                  "FlightStatusInfo",
                  { filter },
                  (_err: any, event: any) => {
                    const statusCode = event?.returnValues?.status;
                    cbWhenStatusReceived?.(statusCode);
                    resolve(statusCode);
                  }
                );
              }
            );

            // return promisifyWeb3Call(() =>
            contract.methods
              .fetchFlightStatus(
                args.airline,
                args.flightNumber,
                args.timestamp
              )
              .send(args.from ? { from: args.from } : {});
            // );
            if (cbWhenStatusReceived) resolve(undefined);
          } catch (e) {
            reject(e);
          }
        });
      },
      purchaseInsurance: (args: {
        flightNumber: string;
        airline: Address;
        from: Address;
        value: string; // in Wei
      }) => {
        console.log("[sending purchaseInsurance(…)]");
        return promisifyWeb3Call(() =>
          contract.methods
            .purchaseInsurance(args.flightNumber, args.airline)
            .send({ from: args.from, value: args.value })
        );
      },
      queryCredit: (args: { from: Address }) => {
        console.log("[calling queryCredit()]");
        return promisifyWeb3Call<string>(() =>
          contract.methods.queryCredit().call(args)
        );
      },
      queryPurchasedInsurance: (args: {
        flightNumber: string;
        airline: Address;
        from: Address;
      }) => {
        console.log("[calling queryPurchasedInsurance()]");
        return promisifyWeb3Call<string>(() =>
          contract.methods
            .queryPurchasedInsurance(args.flightNumber, args.airline)
            .call({ from: args.from })
        );
      },
      withdrawCredit: (args: { from: Address }) => {
        console.log("[calling withdrawCredit()]");
        return promisifyWeb3Call(() =>
          contract.methods.withdrawCredit().send(args)
        );
      },
      getBalance: (account: Address) => {
        console.log("[calling web3.getBalance()]");
        return promisifyWeb3Call<string>(() => web3.eth.getBalance(account));
      },
      // payAirlineFunds: () => promisifyWeb3Call(() => {}),
    }),
    [contract, web3.eth]
  );

  useEffect(() => {
    if (!isWeb3Initialized) return;

    preparedMethods
      .isOperational()
      .then((result) => setIsOperational(!!result));

    contract.events.AirlineRegistered(
      { fromBlock: 0 },
      (error: any, event: { returnValues: { airline: Address } }) => {
        logWeb3Event(event, error);
        setAirlines((airlines) => [...airlines, event.returnValues.airline]);
      }
    );

    contract.events.InsurancePurchase(
      { fromBlock: 0 },
      (
        error: any,
        event: {
          returnValues: {
            passenger: Address;
            amount: string;
            flightNumber: string;
            airline: Address;
          };
        }
      ) => {
        logWeb3Event(event, error);
        setInsuredPassengers((passengers) =>
          Array.from(new Set([...passengers, event.returnValues.passenger]))
        );
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
    insuredPassengers,
    defaultAccount,
    isWeb3Initialized,
    isOperational,
  };
};
