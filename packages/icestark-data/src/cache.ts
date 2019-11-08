const nameSpace = 'ICESTARK';

export const setCache = (key: string, value: any): void => {
  if (!(window as any)[nameSpace]) {
    (window as any)[nameSpace] = {};
  }
  (window as any)[nameSpace][key] = value;
};

export const getCache = (key: string): any => {
  const icestark: any = (window as any)[nameSpace];
  return icestark && icestark[key] ? icestark[key] : null;
};
