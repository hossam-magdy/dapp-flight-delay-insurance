export const logWeb3Event = (event: any, error?: any) => {
  const eventName = event?.event;
  const returnValues = Object.fromEntries(
    Object.entries(event?.returnValues || {}).filter(
      ([k, v]) => `${parseInt(k)}` !== k
    )
  );
  if (error) {
    console.log(`[event:${eventName}]:`, returnValues, { error });
  } else {
    console.log(`[event:${eventName}]:`, returnValues);
  }
  return { event: eventName, returnValues };
};
