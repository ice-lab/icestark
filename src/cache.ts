export const setCache = (key: string, value: any) => {
  if (!(window as any).ICESTARK) {
    (window as any).ICESTARK = {};
  }
  (window as any).ICESTARK[key] = value;
};

export const getCache = (key: string) => {
  const icestark: any = (window as any).ICESTARK;
  return icestark && icestark[key] ? icestark[key] : null;
};
