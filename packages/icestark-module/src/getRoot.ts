interface GetRootElement {
  (): HTMLElement;
}

export type rootType = string | GetRootElement | HTMLElement;

/**
 * Get rootElement, deal with string | function | HTMLElement
 */
export function getRoot(rootElement: rootType): HTMLElement {
  if (!rootElement) {
    throw new Error('icestark-module: rootElement is required!');
  }

  if (typeof rootElement === 'string') {
    return document.getElementById(rootElement);
  }

  if (typeof rootElement === 'function') {
    return rootElement();
  }

  return rootElement;
}
