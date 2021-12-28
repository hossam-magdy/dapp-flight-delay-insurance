import { web3 } from "./web3";

const STATUS_CODE = {
  UNKNOWN: 0,
  ON_TIME: 10,
  LATE_AIRLINE: 20,
  LATE_WEATHER: 30,
  LATE_TECHNICAL: 40,
  LATE_OTHER: 50,
} as const;

const flights = [
  {
    flightNumber: "Flight1",
    airline: "0x6C0ebE2A2CDBeA429FD3719F56Fb57D7719396F7",
    timestamp: 1000,
    statusCode: STATUS_CODE.ON_TIME,
  },
  {
    flightNumber: "Flight2",
    airline: "0x6C0ebE2A2CDBeA429FD3719F56Fb57D7719396F7",
    timestamp: 2000,
    statusCode: STATUS_CODE.LATE_WEATHER,
  },
  {
    flightNumber: "Flight3",
    airline: "0x6C0ebE2A2CDBeA429FD3719F56Fb57D7719396F7",
    timestamp: Math.round(Date.now() / 1000 - 300),
    statusCode: STATUS_CODE.LATE_AIRLINE,
  },
  {
    flightNumber: "Flight4",
    airline: "0x6C0ebE2A2CDBeA429FD3719F56Fb57D7719396F7",
    timestamp: Math.round(Date.now() / 1000 - 400),
    statusCode: STATUS_CODE.UNKNOWN,
  },
];

const UNKNOWN_FLIGHT = {
  flightNumber: "UnknownFlight",
  airline: "0x6C0ebE2A2CDBeA429FD3719F56Fb57D7719396F7",
  timestamp: 0,
  statusCode: STATUS_CODE.UNKNOWN,
};

const getFlightByNumber = (flightNumber: string) => {
  return flights.find((f) => f.flightNumber === flightNumber);
};

// const getFlightByNumberInKeccak256 = (hashedFlightNumber: string) => {
//   return flights.find(
//     (f) => web3.utils.keccak256(f.flightNumber) === hashedFlightNumber
//   );
// };

export {
  STATUS_CODE,
  UNKNOWN_FLIGHT,
  flights,
  getFlightByNumber,
  // getFlightByNumberInKeccak256,
};
