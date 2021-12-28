export const logWeb3Event = (event: any, error?: any) => {
  const returnValues = Object.fromEntries(
    Object.entries(event.returnValues).filter(
      ([k, v]) => `${parseInt(k)}` !== k
    )
  );
  if (error) {
    console.log(`[event:${event.event}]:`, returnValues, { error });
  } else {
    console.log(`[event:${event.event}]:`, returnValues);
  }
  return { event: event.event, returnValues };
};
