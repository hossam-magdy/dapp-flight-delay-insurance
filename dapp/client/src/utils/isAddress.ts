import Web3 from "web3";
import { Address } from "../types";

export const isAddress = (address: string): address is Address =>
  Web3.utils.isAddress(address);
