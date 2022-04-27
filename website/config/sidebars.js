/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const getDocsFromDir = require('../scripts/getDocsFromDir');

module.exports = {
  guide: [
    'guide',
    'guide/upgrade',
    {
      type: 'category',
      label: '概念',
      collapsed: false,
      items: getDocsFromDir('guide/concept'),
    },
    {
      type: 'category',
      label: '主应用接入',
      collapsed: false,
      items: getDocsFromDir('guide/use-layout'),
    },
    {
      type: 'category',
      label: '微应用接入',
      collapsed: false,
      items: getDocsFromDir('guide/use-child'),
    },
    {
      type: 'category',
      label: '进阶',
      collapsed: false,
      items: getDocsFromDir('guide/advanced'),
    },
    'guide/ecosystem',
    'guide/micro-module',
  ],
  api: [
    'api/ice-stark',
    'api/ice-stark-app',
    'api/stark-module',
  ],
};
