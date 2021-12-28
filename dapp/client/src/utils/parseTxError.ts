type RevertErrorData = {
  error: "revert";
  reason: string;
  return: string;
  program_counter: number;
};

const ERROR_MSG_REVERT =
  "Returned error: VM Exception while processing transaction: revert";

/**
 * Extracts the revert error message from a TX error object
 */
export const parseTxError = (e: any) => {
  const revertErrorData =
    typeof e.data === "object" &&
    (Object.values<string | RevertErrorData>(e.data).find(
      (v) => typeof v === "object" && v.error === "revert" && v.reason
    ) as RevertErrorData | undefined);

  const revertReason: string | undefined = revertErrorData
    ? revertErrorData?.reason
    : e?.message?.startsWith(ERROR_MSG_REVERT)
    ? e?.message?.replace(ERROR_MSG_REVERT, "")
    : undefined;

  return {
    revertReason,
    revertErrorData,
    error: e,
  };
};
