const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

/** @typedef {{
    accounts: {
        owner: string;
        airlines: string[];
        passengers: string[];
        oracles: string[];
    };
    flightSuretyData: any;
    flightSuretyApp: any;
}} config */

const configTests = async (
  /** @type string[] */
  accounts
) => {
  const [owner] = accounts;
  const airlines = accounts.slice(1, 6);
  const passengers = accounts.slice(6, 11);
  const oracles = accounts.slice(11);

  const flightSuretyData = await FlightSuretyData.new();
  const flightSuretyApp = await FlightSuretyApp.new();

  return {
    accounts: {
      owner,
      airlines,
      passengers,
      oracles,
    },
    flightSuretyData,
    flightSuretyApp,
  };
};

module.exports = { configTests };
