"use client";

import {
  getAddress,
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected) {
    throw new Error("Freighter wallet not found. Please install the Freighter extension.");
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
