export const any2AnyArray = <T>(any: T | T[]): T[] => (Array.isArray(any) ? any : [any]);

export const propertyChecker = (checker: (property) => boolean) => (property): boolean => {
  return checker(property);
};