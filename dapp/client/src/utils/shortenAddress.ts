import { Address } from "../types";

const VISIBLE_ADDRESS_CHARS = 4;

export const shortenAddress = (address: Address) =>
  `${address.substring(0, VISIBLE_ADDRESS_CHARS + 0)}...${address.substring(
    address.length - VISIBLE_ADDRESS_CHARS
  )}`;
