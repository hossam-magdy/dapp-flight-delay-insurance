import { parseTxError } from "./parseTxError";

export const promisifyWeb3Call = <T>(
  wrapperCb: (resolveFn: (result: T) => any) => any,
  { autoResolve = true }: { autoResolve?: boolean } = {}
) =>
  new Promise<T>(async (resolve, reject) => {
    let resolved = false;
    const resolveFn: typeof resolve = (...args) => {
      resolved = true;
      resolve(...args);
    };
    try {
      const result = await wrapperCb(resolveFn);
      if (autoResolve && !resolved) {
        console.log("Result:", result);
        resolveFn(result);
      }
    } catch (e) {
      const { revertReason, error } = parseTxError(e);
      if (typeof revertReason === "string") {
        reject(revertReason);
      } else if (typeof error?.message === "string") {
        reject(error.message);
      } else {
        console.error("Unknown Error", { error });
        reject("Unknown Error: " + error?.message);
      }
    }
  });
