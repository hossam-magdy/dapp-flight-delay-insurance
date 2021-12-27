import { useFlightSuretyAppContract } from "./hooks";

export type Address = string;

export enum FlightStatusCode {
  UNKNOWN = 0,
  ON_TIME = 10,
  LATE_AIRLINE = 20,
  LATE_WEATHER = 30,
  LATE_TECHNICAL = 40,
  LATE_OTHER = 50,
}

export type Flight = {
  flightNumber: string;
  airline: Address;
  timestamp: number;
  statusCode: FlightStatusCode;
};

// export { Contract } from "web3-eth-contract";
export type Contract = ReturnType<typeof useFlightSuretyAppContract>["contract"];
