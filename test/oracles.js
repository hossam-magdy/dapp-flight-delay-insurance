const { configTests } = require("../testsConfig.js");

/** @type import("../testsConfig.js").config */
let config;
const TEST_ORACLES_COUNT = 5; // TODO increase to 20
// Watch contract events
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

contract("Oracles", async (accounts) => {
  before("setup contract", async () => {
    config = await configTests(accounts);
  });

  const registerOracles = async () => {
    // ARRANGE
    const fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
    const oracleAccounts = config.accounts.oracles;

    // ACT
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      await config.flightSuretyApp.registerOracle({
        from: oracleAccounts[a],
        value: fee,
      });
      const result = await config.flightSuretyApp.getMyIndexes.call({
        from: oracleAccounts[a],
      });
      console.log(
        `Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`
      );
    }
  };

  it("can register oracles", async () => {
    await registerOracles();
  });

  it.only("can request flight status", async () => {
    // ARRANGE
    await registerOracles();
    const flight = "ND1309"; // Course number
    const timestamp = Math.floor(Date.now() / 1000);
    const oracleAccounts = config.accounts.oracles;

    // Submit a request for oracles to get status information for a flight
    await config.flightSuretyApp.fetchFlightStatus(
      config.accounts.airlines[0],
      flight,
      timestamp
    );
    // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      // Get oracle information
      const oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({
        from: oracleAccounts[a],
      });
      for (let idx = 0; idx < 3; idx++) {
        try {
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(
            oracleIndexes[idx],
            config.accounts.airlines[0],
            flight,
            timestamp,
            STATUS_CODE_ON_TIME,
            { from: oracleAccounts[a] }
          );
        } catch (e) {
          // Enable this when debugging
          console.log(
            e,
            "\nError",
            idx,
            oracleIndexes[idx].toNumber(),
            flight,
            timestamp
          );
        }
      }
    }
  });
});
