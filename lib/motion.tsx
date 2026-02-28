// Lightweight shim for `framer-motion` to avoid installing peer-conflicting package.
// This intentionally ignores animation props (`initial`, `animate`, `exit`, `variants`, etc.)
// and just renders normal elements so the app can build without `framer-motion`.
// @ts-nocheck
import React from 'react';

const handler = {
  get(_target, tag) {
    // Return a simple component for motion.<tag>
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      return React.createElement(tag as any, { ref, ...props }, children);
    });
  }
};

const motion = new Proxy({}, handler);

export const AnimatePresence = ({ children }: any) => React.createElement(React.Fragment, null, children);
export default motion;
