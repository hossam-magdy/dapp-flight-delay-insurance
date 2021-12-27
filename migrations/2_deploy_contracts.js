const FlightSuretyApp = artifacts.require('FlightSuretyApp');
const FlightSuretyData = artifacts.require('FlightSuretyData');
const fs = require('fs');

module.exports = (deployer) => {
  let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
  deployer.deploy(FlightSuretyData).then(() => {
    return deployer.deploy(FlightSuretyApp).then(() => {
      const config = {
        localhost: {
          url: 'http://localhost:8545',
          dataAddress: FlightSuretyData.address,
          appAddress: FlightSuretyApp.address,
        },
      };
      fs.writeFileSync(
        __dirname + '/../build/deployedConfig.json',
        JSON.stringify(config, null, 2),
        'utf-8'
      );
    });
  });
};
