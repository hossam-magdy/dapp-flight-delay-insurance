import { Address } from "types";
import { isAddress, shortenAddress } from "utils";

export const Select: React.VFC<{
  value: Address | undefined;
  onChange: (a: Address) => any;
  options: (
    | Address
    | { value: Address; label?: string; prefix?: string; suffix?: string }
  )[];
  placeholder?: string;
}> = ({ options, value = "", onChange, placeholder = "Choose account …" }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((a) => {
        const address = typeof a === "string" ? a : a.value;
        const label =
          typeof a === "string"
            ? isAddress(a)
              ? shortenAddress(a)
              : a
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
