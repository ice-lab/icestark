import { rootType, getRoot } from './getRoot';
import { loadEntry, loadEntryContent, appendAssets } from './handleAssets';

export default class IcestarkModule {
  root: HTMLElement;

  entry: string | string[];

  wrapperId: string;

  constructor(
    rootElement: rootType,
    entry: string | string[],
    wrapperId: string = 'icestark-module',
  ) {
    this.root = getRoot(rootElement);
    this.entry = entry;
    this.wrapperId = wrapperId;
  }

  async mount() {
    const { root, wrapperId, entry } = this;
    // create wapper element
    const wrapper = document.createElement('div');
    wrapper.setAttribute('id', wrapperId);
    root.appendChild(wrapper);

    if (typeof entry === 'string') {
      // string treated as html entry
      if (entry.indexOf('<head>') === -1) {
        // no <head> -> htmlUrl
        await loadEntry(wrapper, entry);
      } else {
        // has <head> -> htmlContent
        await loadEntryContent(wrapper, entry, location.href);
      }
    } else if (Array.isArray(entry)) {
      // create assetsWrapper for append assets
      const assetsWrapper = document.createElement('div');
      assetsWrapper.setAttribute('id', `${wrapperId}-assets`);
      root.appendChild(assetsWrapper);

      await appendAssets(assetsWrapper, entry);
    } else {
      throw new Error('icestark-module: entry is required and must be string or array!');
    }
  }

  async unmount() {
    let { root } = this;
    if (!root) return;

    root.innerHTML = '';
    root = null;
  }
}
