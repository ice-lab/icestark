export function warn(message: string): void {
  return console && console.warn(message);
}

export function error(message: string): void {
  return console && console.error(message);
}
