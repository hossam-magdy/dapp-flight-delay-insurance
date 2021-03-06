import Web3 from "web3";
import { abi as FlightSuretyAppABI } from "./compiled-contracts/contracts/FlightSuretyApp.json";
import { localhost as config } from "./compiled-contracts/deployedConfig.json";

const url = config.url.replace("http", "ws");
const wsProvider = new Web3.providers.WebsocketProvider(url);

const web3 = new Web3(wsProvider);

const getAccounts = (): Promise<string[]> => web3.eth.getAccounts();
// / top-level await still not supported by stable versions
// const accounts: string[] = await web3.eth.getAccounts();

getAccounts().then((accounts) => {
  web3.eth.defaultAccount = accounts[0];
});

const contracts = {
  flightSuretyApp: new web3.eth.Contract(
    // till https://github.com/microsoft/TypeScript/issues/32063
    FlightSuretyAppABI as any,
    config.appAddress
  ),
} as const;

const logWeb3Event = (event: any, error?: any) => {
  const returnValues = Object.fromEntries(
    Object.entries(event.returnValues).filter(
      ([k, v]) => `${parseInt(k)}` !== k
    )
  );
  if (error) {
    console.log(`[event:${event.event}]:`, returnValues, { error });
  } else {
    console.log(`[event:${event.event}]:`, returnValues);
  }
};

export { web3, contracts, getAccounts, logWeb3Event };
