"use client";

import {
  getPublicKey,
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected) {
    throw new Error("Freighter wallet not found. Please install the Freighter extension.");
  }
  const publicKey = await getPublicKey();
  return publicKey;
}

export async function signTx(xdr: string, networkPassphrase: string): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase });
  return result;
}
