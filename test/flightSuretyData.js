const { configTests } = require("../testsConfig.js");
const truffleAssert = require("truffle-assertions");

/** @type import("../testsConfig.js").config */
let config;

contract("Flight Surety Data", async (accounts) => {
  before("setup contract", async () => {
    config = await configTests(accounts);
  });

  it(`(authorizedCaller) blocks unauthorized callers`, async () => {
    const sampleMethod = config.flightSuretyData.pay;
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address
    );
    await sampleMethod.call({ from: config.flightSuretyApp.address });
    await truffleAssert.reverts(
      sampleMethod.call({ from: config.accounts.airlines[0] }),
      "Caller is not authorized"
    );
  });

  it(`(operational) has correct initial isOperational() value`, async function () {
    const status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(operational) can allow access to setOperatingStatus() for Contract Owner only`, async () => {
    await truffleAssert.passes(
      config.flightSuretyData.setOperatingStatus.call(false, {
        from: config.accounts.owner,
      }),
      "setOperatingStatus should be allowed for contract-owner account"
    );
    await truffleAssert.reverts(
      config.flightSuretyData.setOperatingStatus.call(false, {
        from: config.accounts.airlines[0],
      }),
      "Caller is not contract owner",
      "setOperatingStatus should NOT be allowed for non-contract-owner accounts"
    );
  });
});
