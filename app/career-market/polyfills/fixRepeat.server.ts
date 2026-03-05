// Server-side polyfill to guard String.repeat from negative counts
const _origRepeat = String.prototype.repeat;
Object.defineProperty(String.prototype, '__orig_repeat__', {
  value: _origRepeat,
  configurable: true,
});
String.prototype.repeat = function (count: number) {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return '';
  return _origRepeat.call(this, n);
};

export {};
