const removeTrailingSlash = (str:string) => {
  return str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str;
};

export default removeTrailingSlash;
