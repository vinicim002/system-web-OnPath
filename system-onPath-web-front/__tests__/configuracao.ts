import { webcrypto } from "node:crypto";

// O jsdom pode não expor crypto.randomUUID; usa o webcrypto do Node nesse caso.
if (typeof globalThis.crypto?.randomUUID !== "function") {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
}
