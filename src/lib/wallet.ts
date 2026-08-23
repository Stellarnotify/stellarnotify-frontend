"use client";

import {
  getAddress,
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";

/** Returns true if the Freighter extension is present in the browser. */
export function isFreighterInstalled(): boolean {
  return typeof window !== "undefined" && "freighter" in window;
}

export async function connectWallet(): Promise<string> {
  if (!isFreighterInstalled()) {
    throw new Error("FREIGHTER_NOT_INSTALLED");
  }
  const connected = await isConnected();
  if (!connected) {
    throw new Error("Freighter is installed but not connected. Please unlock it and try again.");
  }
  const result = await getAddress();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.address;
}

export async function signTx(xdr: string, networkPassphrase: string): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase });
  if (result.error) {
    throw new Error(result.error);
  }
  return result.signedTxXdr;
}
