const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require("fs");

module.exports = async (deployer) => {
  await deployer.deploy(FlightSuretyData);
  await deployer.deploy(FlightSuretyApp);

  // Link both contracts right after deployment
  // https://ethereum.stackexchange.com/a/67498
  // return deployer.deploy(FlightSuretyApp).then(async () => {
  const flightSuretyData = await FlightSuretyData.deployed();
  const flightSuretyApp = await FlightSuretyApp.deployed();
  await flightSuretyData.authorizeCaller(FlightSuretyApp.address);
  await flightSuretyApp.setDataContractAddress(flightSuretyData.address);

  // Write addresses in config file, for DApp (client), and Oracles (server)
  const config = {
    localhost: {
      url: "http://localhost:8545",
      dataAddress: FlightSuretyData.address,
      appAddress: FlightSuretyApp.address,
    },
  };
  fs.writeFileSync(
    __dirname + "/../build/deployedConfig.json",
    JSON.stringify(config, null, 2),
    "utf-8"
  );
};
