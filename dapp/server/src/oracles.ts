import { getFlightByNumber, UNKNOWN_FLIGHT } from "./data";
import { contracts, getAccounts, logWeb3Event, web3 } from "./web3";

const { flightSuretyApp } = contracts;

// [0] is owner, [1-5] are airlines, [6-10] are passengers, so oracles start from [11-…]
const firstAccountIndex = 11;
const noOfOracles = 25;

const regFee = web3.utils.toWei("0.4", "ether");

class Oracle {
  constructor(public address: string, public indexes: number[] = []) {}

  setIndexes(indexes: (string | number)[]) {
    this.indexes = indexes.map((i) => parseInt(`${i}`)); // ['1', '2', '3']
  }
}

const oracles: Oracle[] = [];

const getOraclesHavingIndex = (index: number | string) => {
  const indexNum = parseInt(`${index}`);
  return oracles.filter((o) => o.indexes.includes(indexNum));
};

const startOracles = async () => {
  // STEP: spin-up/register the oracles and maybe persist the state (index)
  //#region Register Oracles (send registration request to smart cpntract, get an index/ID)
  const accounts = await getAccounts();
  if (!accounts || !accounts.length) {
    console.error("Can not fetch accounts");
    process.exit(1);
  }
  for (let i = firstAccountIndex; i < noOfOracles + firstAccountIndex; i++) {
    const address = accounts[i];
    console.log(
      `Requesting registeration for oracle, using account #${i}, ${address}, balance: ${await web3.eth.getBalance(
        address
      )}`
    );
    oracles.push(new Oracle(address));
  }
  // Why event OracleRegistered instead of using return value of registerOracle?
  // https://ethereum.stackexchange.com/a/58238
  flightSuretyApp.events.OracleRegistered(
    // fromBlock: 0,
    {},
    async (error: any, event: { returnValues: { oracleAddress: string } }) => {
      if (!event.returnValues) {
        logWeb3Event(event, error);
      }
      const oracleFound = oracles.find(
        (o) => o.address === event.returnValues.oracleAddress
      );
      if (oracleFound) {
        oracleFound.setIndexes(
          await flightSuretyApp.methods
            .getMyIndexes()
            .call({ from: oracleFound.address })
        );
        console.log(
          `Registered oracle, Address: ${
            oracleFound.address
          }, Indexes: [${oracleFound.indexes.join()}]`
        );
      }
    }
  );
  oracles.forEach(({ address }) => {
    flightSuretyApp.methods
      .registerOracle()
      .send({ from: address, value: regFee })
      .catch((e: any) => {
        console.error("[ERROR:registerOracle]", address, e.message, e);
      });
  });

  //#endregion

  // STEP: on request/event (OracleRequest), send to contract the flight status (late or not), by invoking contract method
  flightSuretyApp.events.OracleRequest(
    // { fromBlock: 0 },
    {},
    async (
      error: any,
      event: {
        returnValues: {
          index: string;
          airline: string;
          flightNumber: string;
          timestamp: number;
        };
      }
    ) => {
      const { returnValues: eventValues } = event;
      logWeb3Event(event, error);

      const flight =
        getFlightByNumber(eventValues.flightNumber) || UNKNOWN_FLIGHT;
      flight.timestamp = eventValues.timestamp;

      const oraclesToReply = getOraclesHavingIndex(eventValues.index);
      console.log(
        oraclesToReply.length,
        "oracles to reply/report",
        oraclesToReply.map((o) => [o.address, o.indexes.join()])
      );
      for (const oracleToReply of oraclesToReply) {
        console.log("Sending reply from oracle", oracleToReply.address, [
          eventValues.index,
          eventValues.airline, // airline
          flight.flightNumber, // flightNumber
          eventValues.timestamp, // timestamp
          flight.statusCode, // statusCode
        ]);
        try {
          await flightSuretyApp.methods
            .submitOracleResponse(
              eventValues.index, // index
              eventValues.airline, // airline
              flight.flightNumber, // flightNumber
              eventValues.timestamp, // timestamp
              flight.statusCode // statusCode
            )
            .send({ from: oracleToReply.address });
        } catch (e: any) {
          console.error("[Failed to submitOracleResponse]", e?.message);
        }
        // console.log({ hash });
      }
    }
  );
};

export { startOracles };
