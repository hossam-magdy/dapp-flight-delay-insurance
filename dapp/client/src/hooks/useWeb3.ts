import { useState } from "react";
import Web3 from "web3";
import { config } from "config";

export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]); // initialize as empty array, and rely on `isInitialized` boolean state

  const [web3] = useState(() => {
    const provider = new Web3.providers.WebsocketProvider(config.url);
    provider.on("close", () => {
      setIsConnected(false);
    });
    const web3 = new Web3(provider);
    web3.eth.getAccounts((err, acc) => {
      if (err) {
        console.log(err);
        return;
      }
      web3.defaultAccount = acc[0];
      setAccounts(acc);
      setIsConnected(true); // Important to set this LAST
    });
    return web3;
  });

  return {
    web3,
    accounts,
    defaultAccount: accounts?.[0],
    isConnected,
  };
};
