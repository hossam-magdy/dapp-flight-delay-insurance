type RevertErrorData = {
  error: "revert";
  reason: string;
  return: string;
  program_counter: number;
};
export const parseTxError = (e: any) => {
  const revertErrorData =
    typeof e.data === "object" &&
    (Object.values<string | RevertErrorData>(e.data).find(
      (v) => typeof v === "object" && v.error === "revert" && v.reason
    ) as RevertErrorData | undefined);

  const revertReason: string | undefined = revertErrorData
    ? revertErrorData?.reason
    : undefined;

  return {
    revertReason,
    revertErrorData,
    error: e,
  };
};
