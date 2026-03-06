// Patch String.repeat at Node startup to avoid RangeError on negative counts during dev
const _orig = String.prototype.repeat;
Object.defineProperty(String.prototype, '__orig_repeat__', {
  value: _orig,
  configurable: true,
});
String.prototype.repeat = function (count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return '';
  return _orig.call(this, n);
};

// no exports — this module is required for side-effects
