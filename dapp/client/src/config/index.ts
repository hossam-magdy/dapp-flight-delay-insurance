import FlightSuretyApp from './compiled-contracts/contracts/FlightSuretyApp.json';
import Config from './compiled-contracts/deployedConfig.json';

// network = localhost
const { localhost } = Config;

export { localhost as config, FlightSuretyApp };
