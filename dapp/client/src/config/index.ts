import FlightSuretyApp from "./compiled-contracts/contracts/FlightSuretyApp.json";
import Config from "./compiled-contracts/deployedConfig.json";

const config = {
  ...Config.localhost, // network = localhost
  url: Config.localhost.url.replace("http", "ws"),
};

const FLIGHTS_API_URL = "http://localhost:3000/api";

export { config, FlightSuretyApp, FLIGHTS_API_URL };
