/**
 * format url
 * @param url
 * @param hashType
 */
const formatUrl = (url: string, hashType?: boolean) => {
  return (hashType && url.indexOf('#') === -1) ? `#${url}` : url;
};

export default formatUrl;
