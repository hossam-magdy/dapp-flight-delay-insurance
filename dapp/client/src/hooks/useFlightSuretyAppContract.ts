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
    isConnected: isWeb3Connected,
  } = useWeb3();

  const [contract] = useState(
    () => new web3.eth.Contract(FlightSuretyApp.abi as any, config.appAddress)
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
        return promisifyWeb3Call(async () => {
          const tx = contract.methods.payAirlineFunds();
          const gas = await tx.estimateGas(args);
          return tx.send({ ...args, gas });
        });
      },
      registerAirline: (args: { newAirline: Address; from: Address }) => {
        console.log("[sending registerAirline(…)]");
        return promisifyWeb3Call(async () => {
          const tx = contract.methods.registerAirline(args.newAirline);
          const gas = await tx.estimateGas({ from: args.from });
          return tx.send({ from: args.from, gas });
        });
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
        return new Promise(async (resolve, reject) => {
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

            const tx = contract.methods.fetchFlightStatus(
              args.airline,
              args.flightNumber,
              args.timestamp
            );
            const txArgs = args.from ? { from: args.from } : {};
            const gas = await tx.estimateGastxArgs;
            tx.send(args.from ? { ...txArgs, gas } : { gas });

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
        return promisifyWeb3Call(async () => {
          const tx = contract.methods.purchaseInsurance(
            args.flightNumber,
            args.airline
          );
          const gas = await tx.estimateGas({
            from: args.from,
            value: args.value,
          });
          return tx.send({ from: args.from, value: args.value, gas });
        });
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
        return promisifyWeb3Call(async () => {
          const tx = contract.methods.withdrawCredit();
          const gas = await tx.estimateGas(args);
          return tx.send({ ...args, gas });
        });
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
    if (!isWeb3Connected) return;

    preparedMethods
      .isOperational()
      .then((result) => setIsOperational(!!result));

    contract.events.AirlineRegistered(
      { fromBlock: 0 },
      (error: any, event: { returnValues: { airline: Address } }) => {
        logWeb3Event(event, error);
        const airline = event?.returnValues?.airline;
        if (airline) setAirlines((airlines) => [...airlines, airline]);
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
        const passenger = event?.returnValues?.passenger;
        if (passenger)
          setInsuredPassengers((passengers) =>
            Array.from(new Set([...passengers, passenger]))
          );
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Connected]);

  return {
    contract: useMemo(
      () => Object.assign(contract, { preparedMethods }),
      [contract, preparedMethods]
    ),
    accounts,
    airlines,
    insuredPassengers,
    defaultAccount,
    isOperational,
    isWeb3Connected,
  };
};
