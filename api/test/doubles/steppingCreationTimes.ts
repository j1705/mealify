export function steppingCreationTimes(): () => Date {
  const start = Date.now();
  let step = 0;
  return () => new Date(start + ++step);
}
