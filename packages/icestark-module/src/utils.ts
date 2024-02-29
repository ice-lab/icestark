export const any2AnyArray = <T>(any: T | T[]): T[] => (Array.isArray(any) ? any : [any]);

export const isEsModule = (esModule) => {
  try {
    return esModule && esModule.__esModule;
  } catch (error) {
    // 在某些场景下，例如：iframe，访问属性会存在跨域问题，会直接报错
    // 这种情况，直接忽略不做diff比较
    return false;
  }
};
