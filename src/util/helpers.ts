export const isDev = process.env.NODE_ENV === 'development';

export const toArray = <T>(any: T | T[]): T[] => {
  return Array.isArray(any) ? any : [any];
};

export const formatMessage = (msg: string): string => {
  return `[icestark]: ${msg}`;
};
