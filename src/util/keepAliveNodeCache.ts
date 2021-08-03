let cache = {};

const keep = (id: string, node?: HTMLElement, listeners?: any) => {
  if (node) {
    cache[id] = { id, node, listeners };
  }
  return cache[id];
};

const remove = () => {
  cache = {};
};

export {
  keep,
  remove,
};