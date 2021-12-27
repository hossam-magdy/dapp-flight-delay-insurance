const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic =
  "tilt lunar exile blame merry good little undo evidence useful rotate error";
// 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';

// const { readFileSync } = require('fs');
// const infuraKey = readFileSync('.secret.infuraKey'); // '1cbe12...';
// const mnemonic = readFileSync('.secret.mnemonic').toString().trim();
// const url = `https://rinkeby.infura.io/v3/${infuraKey}`;

const url = "http://127.0.0.1:8545/";

const noOfAccounts = 31; // 1 owner, 5 airlines, 5 passengers, rest are/can be oracles

module.exports = {
  networks: {
    development: {
      provider: () =>
        new HDWalletProvider({
          mnemonic,
          url,
          // for `truffle test`
          numberOfAddresses: noOfAccounts + 1,
        }),
      network_id: "*", // Match any network id
      // host: '127.0.0.1',
      // port: 8545,
      // gas: 9999999,
    },
    develop: {
      port: 8545,
      // for `truffle develop`
      accounts: noOfAccounts + 1,
    },
  },
  compilers: {
    solc: {
      version: "^0.8.11",
    },
  },
};
