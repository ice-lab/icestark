export const PREFIX: string = 'icestark';

export const ICESTSRK_404: string = `/${PREFIX}_404`;

export const setIcestark = (key: string, value: any) => {
  if (!(window as any).__ICESTARK__) {
    (window as any).__ICESTARK__ = {};
  }
  (window as any).__ICESTARK__[key] = value;
};

export const getIcestark = (key: string) => {
  const icestark: any = (window as any).__ICESTARK__;
  return icestark && icestark[key] ? icestark[key] : null;
};
