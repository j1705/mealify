import type { ChangeEvent, InputHTMLAttributes } from "react";
import { isDecimalDraft } from "../../utils/decimal";

type DecimalInputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "autoComplete" | "value" | "onChange"
>;

export function decimalInputProps(
  value: string,
  onValueChange: (text: string) => void,
): DecimalInputProps {
  return {
    type: "text",
    inputMode: "decimal",
    autoComplete: "off",
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (isDecimalDraft(event.target.value)) onValueChange(event.target.value);
    },
  };
}
