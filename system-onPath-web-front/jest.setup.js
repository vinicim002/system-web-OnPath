// O jsdom pode não expor crypto.randomUUID; usa o webcrypto do Node nesse caso.
if (typeof globalThis.crypto === "undefined" || typeof globalThis.crypto.randomUUID !== "function") {
  Object.defineProperty(globalThis, "crypto", {
    value: require("node:crypto").webcrypto,
    configurable: true,
  });
}
