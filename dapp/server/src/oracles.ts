import { getFlightByNumber, UNKNOWN_FLIGHT } from './data';
import { contracts, getAccounts, web3 } from './web3';

const { flightSuretyApp } = contracts;

// [0] is owner, [1-5] are airlines, [6-10] are passengers, so oracles start from [11-…]
const firstAccountIndex = 11;
const noOfOracles = 15;

const regFee = web3.utils.toWei('0.4', 'ether');

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
    async (_err: any, event: { returnValues: { oracleAddress: string } }) => {
      if (!event.returnValues) {
        console.error('[event:OracleRegistered]', { _err, event });
      }
      const oracleFound = oracles.find(
        (o) => o.address === event.returnValues.oracleAddress
      );
      // console.log('[event:OracleRegistered]', oracleAddress, oracleRegistered);
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
        console.error('[ERROR:registerOracle]', address, e.message, e);
      });
  });

  //#endregion

  // STEP: on request/event (OracleRequest), send to contract the flight status (late or not), by invoking contract method
  flightSuretyApp.events.OracleRequest(
    // { fromBlock: 0 },
    {},
    async (
      _err: any,
      event: {
        returnValues: {
          index: string;
          airline: string;
          flight: string;
          timestamp: number;
        };
      }
    ) => {
      const { returnValues: eventValues } = event;
      console.log('[event:OracleRequest]', eventValues);

      const flight = getFlightByNumber(eventValues.flight) || UNKNOWN_FLIGHT;
      flight.timestamp = eventValues.timestamp;

      const oraclesToReply = getOraclesHavingIndex(eventValues.index);
      console.log(
        oraclesToReply.length,
        'oraclesToReply',
        oraclesToReply.map((o) => [o.address, o.indexes.join()])
      );
      for (const oracleToReply of oraclesToReply) {
        // TODO: extract the requested flight number from event data, get its status from hardcoded flights array
        console.log('Sending reply from oracle', oracleToReply.address, [
          eventValues.index,
          flight.airline, // airline
          flight.flightNumber, // flight
          flight.timestamp, // timestamp
          flight.statusCode, // statusCode
        ]);
        await flightSuretyApp.methods
          .submitOracleResponse(
            eventValues.index, // index
            flight.airline, // airline
            flight.flightNumber, // flight
            flight.timestamp, // timestamp
            flight.statusCode // statusCode
          )
          .call({ from: oracleToReply.address });
        // console.log({ hash });
      }
    }
  );
};

export { startOracles };
