const { configTests } = require("../testsConfig.js");
const truffleAssert = require("truffle-assertions");

/** @type import("../testsConfig.js").config */
let config;

contract("Flight Surety App Tests", async (accounts) => {
  before("setup contract", async () => {
    config = await configTests(accounts);
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address
    );
  });

  it(`(airline) isAirline() is returning false for airlines that are not registered`, async () => {
    const {
      airlines: [unregisteredAirline],
    } = config.accounts;
    assert.equal(
      await config.flightSuretyApp.isAirline(unregisteredAirline),
      false
    );
  });

  it(`(airline) existing airlines can registerAirline(), emitting event "AirlineRegistered", and isAirline() returns "true" afterwards`, async () => {
    const {
      owner,
      airlines: [newAirline],
    } = config.accounts;
    assert.equal(await config.flightSuretyApp.isAirline(newAirline), false);
    truffleAssert.eventEmitted(
      await config.flightSuretyApp.registerAirline(newAirline, {
        from: owner,
      }),
      "AirlineRegistered",
      { airline: newAirline }
    );
    assert.equal(await config.flightSuretyApp.isAirline(newAirline), true);
  });

  it(`(airline) block non-existing airlines from registerAirline()`, async () => {
    const { passengers } = config.accounts;
    const [nonAirlineAcount1, nonAirlineAcount2] = passengers;
    truffleAssert.eventNotEmitted(
      await config.flightSuretyApp.registerAirline(nonAirlineAcount2, {
        from: nonAirlineAcount1,
      }),
      "AirlineRegistered"
    );
  });

  // TODO
  it("(airline) does not mark Airline as registered, if it is not funded", async () => {
    // // ARRANGE
    // let newAirline = accounts[2];
    // // ACT
    // try {
    //   await config.flightSuretyApp.registerAirline(newAirline, {
    //     from: config.firstAirline,
    //   });
    // } catch (e) {}
    // let result = await config.flightSuretyData.isAirline.call(newAirline);
    // // ASSERT
    // assert.equal(
    //   result,
    //   false,
    //   "Airline should not be able to register another airline if it hasn't provided funding"
    // );
  });

  it(`(operational) has correct initial isOperational() value`, async () => {
    const status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(operational) blocks access to setOperatingStatus() for non-Contract Owner account`, async () => {
    await truffleAssert.reverts(
      config.flightSuretyData.setOperatingStatus.call(false, {
        from: config.accounts.airlines[2],
      }),
      "Caller is not contract owner"
    );
  });

  it(`(operational) can allow access to setOperatingStatus() for Contract Owner account`, async () => {
    await truffleAssert.passes(
      config.flightSuretyData.setOperatingStatus.call(false, {
        from: config.accounts.owner,
      }),
      "Access not restricted to Contract Owner"
    );
  });

  // TODO
  it(`(operational) can block access to functions using requireIsOperational when operating status is false`, async () => {
    // await config.flightSuretyData.setOperatingStatus(false);
    // let reverted = false;
    // try {
    //   await config.flightSurety.setTestingMode(true);
    // } catch (e) {
    //   reverted = true;
    // }
    // assert.equal(reverted, true, "Access not blocked for requireIsOperational");
    // // Set it back for other tests to work
    // await config.flightSuretyData.setOperatingStatus(true);
  });
});
