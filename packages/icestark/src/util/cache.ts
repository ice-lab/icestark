const namespace = 'ICESTARK';

export const setCache = (key: string, value: any): void => {
  if (!(window as any)[namespace]) {
    (window as any)[namespace] = {};
  }
  (window as any)[namespace][key] = value;
};

export const getCache = (key: string): any => {
  const icestark: any = (window as any)[namespace];
  return icestark && icestark[key] ? icestark[key] : null;
};
