const STATUS_CODE = {
  UNKNOWN: 0,
  ON_TIME: 10,
  LATE_AIRLINE: 20,
  LATE_WEATHER: 30,
  LATE_TECHNICAL: 40,
  LATE_OTHER: 50,
};

const flights = [
  {
    flightNumber: 'Hello1',
    airline: '0xcedbf6b6f39e7ab84df5d7d881e08d8ed8918aa4',
    timestamp: 1000,
    statusCode: STATUS_CODE.ON_TIME,
  },
  {
    flightNumber: 'Hello2',
    airline: '0xecc93d9486493ed1022298d1f43305ab85b1ea70',
    timestamp: 2000,
    statusCode: STATUS_CODE.LATE_WEATHER,
  },
  {
    flightNumber: 'Hello3',
    airline: '0xb18315b66fe92ddfca9ee612eac49ea8892fc921',
    timestamp: Math.round(Date.now() / 1000 - 300),
    statusCode: STATUS_CODE.LATE_AIRLINE,
  },
  {
    flightNumber: 'Hello4',
    airline: '0xc6be1fc5561b17f70dc78d78451f1a4b6b6d44a0',
    timestamp: Math.round(Date.now() / 1000 - 400),
    statusCode: STATUS_CODE.UNKNOWN,
  },
];

const UNKNOWN_FLIGHT = {
  flightNumber: 'UNKNOWN',
  airline: '0x0000000000000000000000000000000000000000',
  timestamp: 0,
  statusCode: STATUS_CODE.UNKNOWN,
};

const getFlightByNumber = (flightNumber: string) =>
  flights.find((f) => f.flightNumber === flightNumber);

export { STATUS_CODE, UNKNOWN_FLIGHT, flights, getFlightByNumber };
