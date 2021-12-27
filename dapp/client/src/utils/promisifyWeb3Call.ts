import { parseTxError } from "./parseTxError";

export const promisifyWeb3Call = <T>(
  wrapperCb: (resolveFn: (result: T) => any) => any
) =>
  new Promise<T>(async (resolve, reject) => {
    let resolved = false;
    const resolveFn: typeof resolve = (...args) => {
      resolved = true;
      resolve(...args);
    };
    try {
      const result = await wrapperCb(resolveFn);
      if (!resolved) {
        resolveFn(result);
      }
    } catch (e) {
      const { revertReason, error } = parseTxError(e);
      if (typeof revertReason === "string") {
        reject(revertReason);
      } else {
        console.error("Unknown Error", { error });
        reject("Unknown Error: " + error?.message);
      }
    }
  });
