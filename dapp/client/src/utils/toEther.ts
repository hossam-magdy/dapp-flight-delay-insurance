import Web3 from "web3";

export const toEther = (wei: string | number) =>
  Web3.utils.fromWei(`${wei}`, "ether");
