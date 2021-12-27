import { Address } from "types";
import { shortenAddress } from "utils";

export const SelectAccount: React.VFC<{
  value: Address | undefined;
  onChange: (a: Address) => any;
  accounts: (
    | Address
    | { address: Address; label?: string; prefix?: string; suffix?: string }
  )[];
}> = ({ accounts, value, onChange }) => {
  return (
    <select
      defaultValue={""}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Choose account …
      </option>
      {accounts.map((a) => {
        const address = typeof a === "string" ? a : a.address;
        const label =
          typeof a === "string"
            ? shortenAddress(a)
            : `${a.prefix || ""}${a.label || shortenAddress(address)}${
                a.suffix || ""
              }`;
        return (
          <option key={address} value={address}>
            {label}
          </option>
        );
      })}
    </select>
  );
};
