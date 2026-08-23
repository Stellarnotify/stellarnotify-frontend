import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  nativeToScVal,
  Address,
  xdr,
  scValToNative,
} from "@stellar/stellar-sdk";
import { signTx } from "@/lib/wallet";

const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_NOTIFY_CONTRACT_ID ?? "";

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
  Networks.TESTNET;

export const rpc = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

export const contract = new Contract(CONTRACT_ID);

export async function buildTx(
  sourceAddress: string,
  operation: xdr.Operation
) {
  const account = await rpc.getAccount(sourceAddress);
  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
}

/** Simulate a read-only contract call and decode the result. */
export async function simulateRead<T>(
  operation: xdr.Operation
): Promise<T> {
  const account = await rpc.getAccount(CONTRACT_ID); // dummy source for sim
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }
  const result = (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) throw new Error("No result from simulation");
  return scValToNative(result.retval) as T;
}

/** Convert a channel string to on-chain ScVal enum. */
export function channelToScVal(channel: "Webhook" | "InApp" | "OnChain") {
  return xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol(channel),
  ]);
}

/**
 * Build, simulate, sign (Freighter), and submit a subscribe() call.
 * Returns the transaction hash on success.
 */
export async function callSubscribe(params: {
  callerAddress: string;
  watchedContract: string;
  channel: "Webhook" | "InApp" | "OnChain";
  endpointRef: string;
  ttlLedgers: number;
  topics: string[];
}): Promise<string> {
  const { callerAddress, watchedContract, channel, endpointRef, ttlLedgers, topics } = params;

  // Build the contract call operation
  const operation = contract.call(
    "subscribe",
    new Address(callerAddress).toScVal(),
    new Address(watchedContract).toScVal(),
    channelToScVal(channel),
    nativeToScVal(endpointRef, { type: "bytes" }),
    nativeToScVal(ttlLedgers, { type: "u32" }),
    nativeToScVal(topics.map((t) => nativeToScVal(t, { type: "symbol" })))
  );

  // Build unsigned tx
  const tx = await buildTx(callerAddress, operation);

  // Simulate to get the footprint / resource fees
  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  // Assemble (inject auth + resource fees)
  const assembled = SorobanRpc.assembleTransaction(tx, sim).build();

  // Sign with Freighter
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  // Submit
  const sendResult = await rpc.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  );

  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  // Poll until confirmed
  const hash = sendResult.hash;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const status = await rpc.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return hash;
    }
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${hash}`);
    }
  }

  throw new Error(`Transaction not confirmed after timeout: ${hash}`);
}

/**
 * Build, simulate, sign (Freighter), and submit a cancel() call.
 * Returns the transaction hash on success.
 */
export async function callCancel(params: {
  callerAddress: string;
  subscriptionId: string;
}): Promise<string> {
  const { callerAddress, subscriptionId } = params;

  const operation = contract.call(
    "cancel",
    new Address(callerAddress).toScVal(),
    nativeToScVal(subscriptionId, { type: "u64" })
  );

  const tx = await buildTx(callerAddress, operation);

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  const assembled = SorobanRpc.assembleTransaction(tx, sim).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const sendResult = await rpc.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  );

  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  const hash = sendResult.hash;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const status = await rpc.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) return hash;
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${hash}`);
    }
  }

  throw new Error(`Transaction not confirmed after timeout: ${hash}`);
}
