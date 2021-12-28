import Web3 from "web3";

export const toWei = (ether: string | number) =>
  Web3.utils.toWei(`${ether}`, "ether");
