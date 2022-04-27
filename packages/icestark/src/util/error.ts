export enum ErrorCode {
  'EMPTY_LIFECYCLES' = 1,
  'UNSUPPORTED_IMPORT_BROWSER' = 2,
  'UNSUPPORTED_FETCH' = 3,
  'CANNOT_FIND_APP' = 4,
  'JS_LOAD_ERROR' = 5,
  'CSS_LOAD_ERROR' = 6,
  'ACTIVE_PATH_ITEM_CAN_NOT_BE_EMPTY' = 7,
}

export function normalizeMsg(msg: string, args: string[]) {
  if (args.length === 0) {
    return msg;
  }

  return msg.replace(/\{(\d+)\}/g, (match, p1) => {
    const idx = p1[0];
    if (typeof args[idx] === 'string' || typeof args[idx] === 'number') {
      return args[idx];
    }
    return match;
  });
}

export function formatErrMessage(code: string | number, msg?: string, ...args: string[]) {
  return `icestark minified message #${code}: ${
    normalizeMsg(
      msg ? `${msg}. ` : '',
      args,
    )}See https://micro-frontends.ice.work/error?code=${code}${
    args.length ? `&arg=${args.join('&arg=')}` : ''
  }`;
}
