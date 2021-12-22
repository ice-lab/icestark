export const any2AnyArray = <T>(any: T | T[]): T[] => (Array.isArray(any) ? any : [any]);

export const checkLibraryExport = (libraryExport) => {
  return libraryExport && libraryExport.mount && libraryExport.unmount;
};
