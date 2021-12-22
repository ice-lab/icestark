export const any2AnyArray = <T>(any: T | T[]): T[] => (Array.isArray(any) ? any : [any]);

export const propertyChecker = (checker: (property: any) => boolean) => (property: any): boolean => {
  return checker(property);
};

export const validLibraryExportChecker = propertyChecker((property) => {
  return property && property.mount && property.unmount;
});
