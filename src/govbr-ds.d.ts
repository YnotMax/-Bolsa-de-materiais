/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @govbr-ds/core ships no type declarations for its deep component imports
// (no "types" field, no bundled .d.ts). These ambient declarations cover the
// exact specifiers Header.tsx imports, typed from each class's own JSDoc
// constructor signature, so consumers get real types instead of `any`.

declare module '@govbr-ds/core/dist/components/header/header.js' {
  export default class BRHeader {
    constructor(name: string, component: HTMLElement);
  }
}

declare module '@govbr-ds/core/dist/components/menu/menu.js' {
  export default class BRMenu {
    constructor(name: string, component: HTMLElement);
  }
}
