export default function warn(message: string): void {
  return console && console.warn(message);
}
