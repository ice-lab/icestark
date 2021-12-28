export const any2AnyArray = <T>(any: T | T[]): T[] => (Array.isArray(any) ? any : [any]);

export const isEsModuleChecker = (esModule) => {
  try {
    return esModule && esModule.__esModule;
  } catch (error) {
    return false;
  }
};
